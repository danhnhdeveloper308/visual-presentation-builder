import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Prisma, Project } from '@prisma/client';
import {
  createEmptyPresentation,
  LIMITS,
  type AddCollaboratorInput,
  type CollaboratorDto,
  type CreateProjectInput,
  type ProjectDetail,
  type ProjectRole,
  type ProjectSummary,
  type PublicPresentationDto,
  type SaveProjectInput,
  type SaveProjectResult,
  type ShareInfo,
  type SharedProjectSummary,
  type TrashProjectSummary,
  type UpdateCollaboratorInput,
  type UpdateProjectMetaInput,
  type Presentation,
} from '@repo/shared';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../assets/r2.service';

const SUMMARY_SELECT = {
  id: true,
  title: true,
  thumbnailUrl: true,
  status: true,
  revision: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

const TRASH_SELECT = {
  ...SUMMARY_SELECT,
  ownerId: true,
  deletedAt: true,
} satisfies Prisma.ProjectSelect;

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2Service,
  ) {}

  async list(ownerId: string): Promise<ProjectSummary[]> {
    const projects = await this.prisma.project.findMany({
      where: { ownerId, deletedAt: null },
      select: SUMMARY_SELECT,
      orderBy: { updatedAt: 'desc' },
    });
    return projects.map((p) => this.toSummary(p));
  }

  async create(ownerId: string, input: CreateProjectInput): Promise<ProjectDetail> {
    let content: Prisma.InputJsonValue =
      createEmptyPresentation() as unknown as Prisma.InputJsonValue;

    if (input.templateId) {
      // Cho phép tạo từ template hệ thống (isPublic) HOẶC template riêng của chính user (My Templates)
      const template = await this.prisma.template.findFirst({
        where: { id: input.templateId, OR: [{ isPublic: true }, { createdBy: ownerId }] },
      });
      if (!template) throw new NotFoundException('Không tìm thấy template');
      // Copy nguyên content + sinh lại id slide/element — 2 project từ cùng template không trùng id
      content = this.regenerateIds(
        template.content as unknown as Presentation,
      ) as unknown as Prisma.InputJsonValue;
    }

    const project = await this.prisma.project.create({
      data: { title: input.title, ownerId, content },
    });
    return this.toDetail(project, 'owner');
  }

  /**
   * Nhân bản project của chính mình: copy content + sinh lại id slide/element.
   * KHÔNG copy thumbnailUrl — key thumbnail R2 gắn với project gốc (xóa gốc là
   * link chết); dashboard tự render preview live từ content khi thiếu thumbnail.
   */
  async duplicate(ownerId: string, id: string): Promise<ProjectDetail> {
    const source = await this.findOwned(ownerId, id);
    const title = `Bản sao của ${source.title}`.slice(0, LIMITS.TITLE_MAX);
    const project = await this.prisma.project.create({
      data: {
        title,
        ownerId,
        content: this.regenerateIds(
          source.content as unknown as Presentation,
        ) as unknown as Prisma.InputJsonValue,
      },
    });
    return this.toDetail(project, 'owner');
  }

  private regenerateIds(presentation: Presentation): Presentation {
    return {
      ...presentation,
      slides: presentation.slides.map((slide) => ({
        ...slide,
        id: crypto.randomUUID(),
        elements: slide.elements.map((el) => ({ ...el, id: crypto.randomUUID() })),
      })),
    };
  }

  async get(userId: string, id: string): Promise<ProjectDetail> {
    const { project, role } = await this.findAccessible(userId, id, 'viewer');
    return this.toDetail(project, role);
  }

  /**
   * Optimistic concurrency: updateMany có `revision` trong WHERE — atomic,
   * hai tab cùng save thì tab sau bị 409 thay vì ghi đè âm thầm.
   * Quyền: owner hoặc collaborator role `editor`.
   */
  async saveContent(
    userId: string,
    id: string,
    input: SaveProjectInput,
  ): Promise<SaveProjectResult> {
    const { project } = await this.findAccessible(userId, id, 'editor');
    const previousMediaAssetIds = this.collectMediaAssetIds(project.content);
    const { count } = await this.prisma.project.updateMany({
      where: { id, deletedAt: null, revision: input.revision },
      data: {
        content: input.content as unknown as Prisma.InputJsonValue,
        revision: { increment: 1 },
      },
    });

    if (count === 0) {
      throw new ConflictException('Project đã được cập nhật ở nơi khác — tải lại để tiếp tục');
    }

    // Element media bị xóa khỏi bản mới → giải phóng file R2 nếu không còn nơi nào tham chiếu
    const currentIds = this.collectMediaAssetIds(input.content);
    const removed = [...previousMediaAssetIds].filter((aid) => !currentIds.has(aid));
    if (removed.length > 0) void this.cleanupOrphanMediaAssets(removed);

    return { revision: input.revision + 1 };
  }

  async updateMeta(
    userId: string,
    id: string,
    input: UpdateProjectMetaInput,
  ): Promise<ProjectSummary> {
    await this.findAccessible(userId, id, 'editor');
    const project = await this.prisma.project.update({
      where: { id },
      data: input,
      select: SUMMARY_SELECT,
    });
    return this.toSummary(project);
  }

  async softDelete(ownerId: string, id: string): Promise<void> {
    const { count } = await this.prisma.project.updateMany({
      where: { id, ownerId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (count === 0) throw new NotFoundException('Không tìm thấy project');
  }

  /** Recycle Bin: danh sách project đã xóa mềm của user, mới xóa lên trước. */
  async listTrash(ownerId: string): Promise<TrashProjectSummary[]> {
    const projects = await this.prisma.project.findMany({
      where: { ownerId, deletedAt: { not: null } },
      select: TRASH_SELECT,
      orderBy: { deletedAt: 'desc' },
    });
    return projects.map((p) => ({ ...this.toSummary(p), deletedAt: p.deletedAt!.toISOString() }));
  }

  /** Khôi phục project từ Recycle Bin. */
  async restore(ownerId: string, id: string): Promise<void> {
    const { count } = await this.prisma.project.updateMany({
      where: { id, ownerId, deletedAt: { not: null } },
      data: { deletedAt: null },
    });
    if (count === 0) throw new NotFoundException('Không tìm thấy project trong thùng rác');
  }

  /** Xóa vĩnh viễn — chỉ cho phép với project ĐÃ ở trong Recycle Bin (đã soft-delete). */
  async permanentDelete(ownerId: string, id: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId, deletedAt: { not: null } },
    });
    if (!project) throw new NotFoundException('Không tìm thấy project trong thùng rác');
    await this.purgeProject(project);
  }

  /**
   * Xóa thumbnail R2 + record Asset liên quan + row Project, rồi dọn asset media
   * mà content project này tham chiếu (nếu không còn project/template nào khác dùng).
   * Dùng cho cả xóa tay và cron.
   */
  private async purgeProject(project: Pick<Project, 'id' | 'ownerId' | 'content'>): Promise<void> {
    const thumbnailKey = `${project.ownerId}/thumbnails/${project.id}.png`;
    const asset = await this.prisma.asset.findUnique({ where: { key: thumbnailKey } });
    if (asset) {
      await this.r2.delete(thumbnailKey).catch((err: unknown) => {
        // Không chặn xóa DB nếu R2 lỗi — object mồ côi chấp nhận được, còn hơn kẹt xóa
        this.logger.warn(`Xóa thumbnail R2 thất bại (${thumbnailKey}): ${String(err)}`);
      });
      await this.prisma.asset.delete({ where: { id: asset.id } });
    }
    const mediaAssetIds = [...this.collectMediaAssetIds(project.content)];
    await this.prisma.project.delete({ where: { id: project.id } });
    // Row project đã xóa xong → asset không còn được row này tham chiếu, dọn được ngay
    if (mediaAssetIds.length > 0) await this.cleanupOrphanMediaAssets(mediaAssetIds);
  }

  /** assetId của các element media trong content (file user upload lên R2). */
  private collectMediaAssetIds(content: unknown): Set<string> {
    const ids = new Set<string>();
    const presentation = content as Partial<Presentation> | null;
    for (const slide of presentation?.slides ?? []) {
      for (const el of slide.elements ?? []) {
        if (el.type === 'media' && el.props.assetId) ids.add(el.props.assetId);
      }
    }
    return ids;
  }

  /**
   * Giải phóng dung lượng: xóa asset media (R2 + row) nếu KHÔNG còn project/template
   * nào tham chiếu tới assetId trong content. Content là JSON — tìm tham chiếu bằng
   * text search trên cột jsonb (assetId là cuid, đủ đặc trưng, không dương tính giả).
   * Lỗi chỉ log warn — không chặn flow lưu/xóa chính.
   */
  private async cleanupOrphanMediaAssets(assetIds: string[]): Promise<void> {
    for (const assetId of assetIds) {
      try {
        const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset) continue;
        const pattern = `%${assetId}%`;
        const [projectRefs, templateRefs] = await Promise.all([
          this.prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*)::bigint AS count FROM "Project" WHERE "content"::text LIKE ${pattern}`,
          this.prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*)::bigint AS count FROM "Template" WHERE "content"::text LIKE ${pattern}`,
        ]);
        const refs =
          Number(projectRefs[0]?.count ?? 0n) + Number(templateRefs[0]?.count ?? 0n);
        if (refs > 0) continue;
        await this.r2.delete(asset.key).catch((err: unknown) => {
          this.logger.warn(`Xóa media R2 thất bại (${asset.key}): ${String(err)}`);
        });
        await this.prisma.asset.delete({ where: { id: asset.id } });
        this.logger.log(`Đã giải phóng asset media mồ côi ${assetId} (${asset.key})`);
      } catch (err) {
        this.logger.warn(`Dọn asset media ${assetId} thất bại: ${String(err)}`);
      }
    }
  }

  /**
   * Cron hàng ngày: xóa vĩnh viễn project đã nằm trong Recycle Bin quá
   * `LIMITS.TRASH_RETENTION_DAYS` ngày (REQUIREMENTS.md mục IV).
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeExpiredTrash(): Promise<void> {
    const threshold = new Date(Date.now() - LIMITS.TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const expired = await this.prisma.project.findMany({
      where: { deletedAt: { not: null, lt: threshold } },
      select: { id: true, ownerId: true, content: true },
    });
    for (const project of expired) {
      await this.purgeProject(project).catch((err: unknown) => {
        this.logger.error(`Purge project ${project.id} thất bại: ${String(err)}`);
      });
    }
    if (expired.length > 0) {
      this.logger.log(`Đã xóa vĩnh viễn ${expired.length} project quá hạn Recycle Bin`);
    }
  }

  private async findOwned(ownerId: string, id: string): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Không tìm thấy project');
    return project;
  }

  /**
   * Kiểm tra quyền truy cập project theo vai trò: owner > editor > viewer.
   * Không có quyền gì → 404 (không lộ tồn tại — chống IDOR); có quyền viewer
   * nhưng cần editor → 403.
   */
  private async findAccessible(
    userId: string,
    id: string,
    minRole: 'viewer' | 'editor',
  ): Promise<{ project: Project; role: ProjectRole }> {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: { collaborators: { where: { userId }, select: { role: true } } },
    });
    if (!project) throw new NotFoundException('Không tìm thấy project');
    if (project.ownerId === userId) return { project, role: 'owner' };

    const collab = project.collaborators[0];
    if (!collab) throw new NotFoundException('Không tìm thấy project');
    if (minRole === 'editor' && collab.role !== 'editor') {
      throw new ForbiddenException('Bạn chỉ có quyền xem project này');
    }
    return { project, role: collab.role };
  }

  /* ==================== Share với user (collaborators) ==================== */

  /** Project người khác share cho tôi — hiện ở dashboard mục "Được chia sẻ". */
  async listShared(userId: string): Promise<SharedProjectSummary[]> {
    const collabs = await this.prisma.projectCollaborator.findMany({
      where: { userId, project: { deletedAt: null } },
      include: {
        project: {
          select: { ...SUMMARY_SELECT, owner: { select: { name: true, email: true } } },
        },
      },
      orderBy: { project: { updatedAt: 'desc' } },
    });
    return collabs.map((c) => ({
      ...this.toSummary(c.project),
      role: c.role,
      owner: { name: c.project.owner.name, email: c.project.owner.email },
    }));
  }

  /** Danh sách người được share — owner và mọi collaborator đều xem được. */
  async listCollaborators(userId: string, id: string): Promise<CollaboratorDto[]> {
    await this.findAccessible(userId, id, 'viewer');
    const collabs = await this.prisma.projectCollaborator.findMany({
      where: { projectId: id },
      include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } },
      orderBy: { id: 'asc' },
    });
    return collabs.map((c) => ({
      userId: c.user.id,
      email: c.user.email,
      name: c.user.name,
      avatarUrl: c.user.avatarUrl,
      role: c.role,
    }));
  }

  /** Thêm người theo email (chỉ owner). Đã có → cập nhật role (upsert). */
  async addCollaborator(
    ownerId: string,
    id: string,
    input: AddCollaboratorInput,
  ): Promise<CollaboratorDto> {
    await this.findOwned(ownerId, id);
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });
    if (!user) throw new NotFoundException('Không tìm thấy user với email này');
    if (user.id === ownerId) throw new BadRequestException('Bạn là chủ sở hữu project rồi');

    const collab = await this.prisma.projectCollaborator.upsert({
      where: { projectId_userId: { projectId: id, userId: user.id } },
      update: { role: input.role },
      create: { projectId: id, userId: user.id, role: input.role },
    });
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: collab.role,
    };
  }

  /** Đổi role người được share (chỉ owner). */
  async updateCollaborator(
    ownerId: string,
    id: string,
    targetUserId: string,
    input: UpdateCollaboratorInput,
  ): Promise<void> {
    await this.findOwned(ownerId, id);
    const { count } = await this.prisma.projectCollaborator.updateMany({
      where: { projectId: id, userId: targetUserId },
      data: { role: input.role },
    });
    if (count === 0) throw new NotFoundException('User này chưa được share project');
  }

  /** Gỡ share: owner gỡ bất kỳ ai; collaborator tự rời (targetUserId = chính mình). */
  async removeCollaborator(userId: string, id: string, targetUserId: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      select: { ownerId: true },
    });
    if (!project) throw new NotFoundException('Không tìm thấy project');
    if (project.ownerId !== userId && targetUserId !== userId) {
      throw new NotFoundException('Không tìm thấy project'); // không phải owner, không phải tự rời
    }
    const { count } = await this.prisma.projectCollaborator.deleteMany({
      where: { projectId: id, userId: targetUserId },
    });
    if (count === 0) throw new NotFoundException('User này chưa được share project');
  }

  /* ==================== Share public bằng link ==================== */

  /** Bật share public (chỉ owner) — token đã có thì giữ nguyên (link ổn định). */
  async enableShare(ownerId: string, id: string): Promise<ShareInfo> {
    const project = await this.findOwned(ownerId, id);
    if (project.shareToken) return { shareToken: project.shareToken };
    const updated = await this.prisma.project.update({
      where: { id },
      data: { shareToken: randomBytes(18).toString('base64url') },
      select: { shareToken: true },
    });
    return { shareToken: updated.shareToken };
  }

  /** Tắt share public (chỉ owner) — link cũ chết ngay. */
  async disableShare(ownerId: string, id: string): Promise<ShareInfo> {
    await this.findOwned(ownerId, id);
    await this.prisma.project.update({ where: { id }, data: { shareToken: null } });
    return { shareToken: null };
  }

  /** Xem qua link public — KHÔNG cần đăng nhập, không lộ thông tin chủ sở hữu. */
  async getPublicByToken(token: string): Promise<PublicPresentationDto> {
    const project = await this.prisma.project.findFirst({
      where: { shareToken: token, deletedAt: null },
      select: { title: true, content: true, updatedAt: true },
    });
    if (!project) throw new NotFoundException('Link chia sẻ không tồn tại hoặc đã bị tắt');
    return {
      title: project.title,
      content: project.content as unknown as Presentation,
      updatedAt: project.updatedAt.toISOString(),
    };
  }

  private toSummary(p: Pick<Project, keyof typeof SUMMARY_SELECT>): ProjectSummary {
    return {
      id: p.id,
      title: p.title,
      thumbnailUrl: p.thumbnailUrl,
      status: p.status,
      revision: p.revision,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  private toDetail(p: Project, role: ProjectRole): ProjectDetail {
    return {
      ...this.toSummary(p),
      // content được validate bằng presentationSchema tại thời điểm ghi
      content: p.content as unknown as Presentation,
      myRole: role,
      // token share public chỉ owner được thấy
      shareToken: role === 'owner' ? p.shareToken : null,
    };
  }
}
