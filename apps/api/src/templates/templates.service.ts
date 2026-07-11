import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Template } from '@prisma/client';
import type {
  Presentation,
  SaveAsTemplateInput,
  TemplateDto,
  UpdateTemplateInput,
} from '@repo/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  /** Template hệ thống (isPublic) + template riêng của user — kèm cờ isFavorite theo user hiện tại. */
  async listForUser(userId: string): Promise<TemplateDto[]> {
    const [templates, favorites] = await Promise.all([
      this.prisma.template.findMany({
        where: { OR: [{ isPublic: true }, { createdBy: userId }] },
        orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.templateFavorite.findMany({ where: { userId }, select: { templateId: true } }),
    ]);
    const favSet = new Set(favorites.map((f) => f.templateId));
    return templates.map((t) => this.toDto(t, favSet.has(t.id)));
  }

  async getVisible(userId: string, id: string): Promise<TemplateDto> {
    const template = await this.prisma.template.findFirst({
      where: { id, OR: [{ isPublic: true }, { createdBy: userId }] },
    });
    if (!template) throw new NotFoundException('Không tìm thấy template');
    const fav = await this.prisma.templateFavorite.findUnique({
      where: { userId_templateId: { userId, templateId: id } },
    });
    return this.toDto(template, !!fav);
  }

  /** "Lưu làm template" từ 1 project đang có — ownership của project được ProjectsService.get() enforce. */
  async createFromProject(
    userId: string,
    projectId: string,
    input: SaveAsTemplateInput,
  ): Promise<TemplateDto> {
    const project = await this.projects.get(userId, projectId);
    const template = await this.prisma.template.create({
      data: {
        title: input.title,
        category: input.category,
        content: project.content as unknown as Prisma.InputJsonValue,
        isPublic: false,
        createdBy: userId,
      },
    });
    return this.toDto(template, false);
  }

  /** Nhân bản BẤT KỲ template thấy được (hệ thống hoặc của mình) thành bản riêng mới — sinh lại id slide/element. */
  async duplicate(userId: string, id: string): Promise<TemplateDto> {
    const source = await this.prisma.template.findFirst({
      where: { id, OR: [{ isPublic: true }, { createdBy: userId }] },
    });
    if (!source) throw new NotFoundException('Không tìm thấy template');
    const regenerated = this.regenerateIds(source.content as unknown as Presentation);
    const cloned = await this.prisma.template.create({
      data: {
        title: `${source.title} (bản sao)`,
        category: source.category,
        content: regenerated as unknown as Prisma.InputJsonValue,
        isPublic: false,
        createdBy: userId,
      },
    });
    return this.toDto(cloned, false);
  }

  async update(userId: string, id: string, input: UpdateTemplateInput): Promise<TemplateDto> {
    const { count } = await this.prisma.template.updateMany({
      where: { id, createdBy: userId, isPublic: false },
      data: input,
    });
    if (count === 0) throw new NotFoundException('Không tìm thấy template của bạn');
    const template = await this.prisma.template.findUniqueOrThrow({ where: { id } });
    const fav = await this.prisma.templateFavorite.findUnique({
      where: { userId_templateId: { userId, templateId: id } },
    });
    return this.toDto(template, !!fav);
  }

  async remove(userId: string, id: string): Promise<void> {
    const { count } = await this.prisma.template.deleteMany({
      where: { id, createdBy: userId, isPublic: false },
    });
    if (count === 0) throw new NotFoundException('Không tìm thấy template của bạn');
  }

  /** Đánh dấu / bỏ yêu thích — hoạt động trên mọi template THẤY ĐƯỢC (hệ thống hoặc của mình). */
  async setFavorite(userId: string, id: string, favorite: boolean): Promise<void> {
    const visible = await this.prisma.template.findFirst({
      where: { id, OR: [{ isPublic: true }, { createdBy: userId }] },
      select: { id: true },
    });
    if (!visible) throw new NotFoundException('Không tìm thấy template');
    if (favorite) {
      await this.prisma.templateFavorite.upsert({
        where: { userId_templateId: { userId, templateId: id } },
        update: {},
        create: { userId, templateId: id },
      });
    } else {
      await this.prisma.templateFavorite.deleteMany({ where: { userId, templateId: id } });
    }
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

  private toDto(t: Template, isFavorite: boolean): TemplateDto {
    return {
      id: t.id,
      title: t.title,
      thumbnailUrl: t.thumbnailUrl,
      category: t.category,
      // content được validate bằng presentationSchema tại thời điểm ghi (seed hoặc create/duplicate)
      content: t.content as unknown as Presentation,
      isPublic: t.isPublic,
      createdBy: t.createdBy,
      isFavorite,
    };
  }
}
