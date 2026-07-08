import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Project } from '@prisma/client';
import {
  createEmptyPresentation,
  type CreateProjectInput,
  type ProjectDetail,
  type ProjectSummary,
  type SaveProjectInput,
  type SaveProjectResult,
  type UpdateProjectMetaInput,
  type Presentation,
} from '@repo/shared';
import { PrismaService } from '../prisma/prisma.service';

const SUMMARY_SELECT = {
  id: true,
  title: true,
  thumbnailUrl: true,
  status: true,
  revision: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

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
      const template = await this.prisma.template.findFirst({
        where: { id: input.templateId, isPublic: true },
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
    return this.toDetail(project);
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

  async get(ownerId: string, id: string): Promise<ProjectDetail> {
    const project = await this.findOwned(ownerId, id);
    return this.toDetail(project);
  }

  /**
   * Optimistic concurrency: updateMany có `revision` trong WHERE — atomic,
   * hai tab cùng save thì tab sau bị 409 thay vì ghi đè âm thầm.
   */
  async saveContent(
    ownerId: string,
    id: string,
    input: SaveProjectInput,
  ): Promise<SaveProjectResult> {
    const { count } = await this.prisma.project.updateMany({
      where: { id, ownerId, deletedAt: null, revision: input.revision },
      data: {
        content: input.content as unknown as Prisma.InputJsonValue,
        revision: { increment: 1 },
      },
    });

    if (count === 0) {
      await this.findOwned(ownerId, id); // không tồn tại → 404
      throw new ConflictException('Project đã được cập nhật ở nơi khác — tải lại để tiếp tục');
    }
    return { revision: input.revision + 1 };
  }

  async updateMeta(
    ownerId: string,
    id: string,
    input: UpdateProjectMetaInput,
  ): Promise<ProjectSummary> {
    const { count } = await this.prisma.project.updateMany({
      where: { id, ownerId, deletedAt: null },
      data: input,
    });
    if (count === 0) throw new NotFoundException('Không tìm thấy project');

    const project = await this.prisma.project.findUniqueOrThrow({
      where: { id },
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

  private async findOwned(ownerId: string, id: string): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Không tìm thấy project');
    return project;
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

  private toDetail(p: Project): ProjectDetail {
    return {
      ...this.toSummary(p),
      // content được validate bằng presentationSchema tại thời điểm ghi
      content: p.content as unknown as Presentation,
    };
  }
}
