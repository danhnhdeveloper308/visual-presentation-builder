import { Injectable, NotFoundException } from '@nestjs/common';
import type { Template } from '@prisma/client';
import type { Presentation, TemplateDto } from '@repo/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Trả kèm content — gallery render preview slide đầu trực tiếp (chưa có thumbnail). */
  async list(): Promise<TemplateDto[]> {
    const templates = await this.prisma.template.findMany({
      where: { isPublic: true },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    });
    return templates.map((t) => this.toDto(t));
  }

  async getPublic(id: string): Promise<TemplateDto> {
    const template = await this.prisma.template.findFirst({ where: { id, isPublic: true } });
    if (!template) throw new NotFoundException('Không tìm thấy template');
    return this.toDto(template);
  }

  private toDto(t: Template): TemplateDto {
    return {
      id: t.id,
      title: t.title,
      thumbnailUrl: t.thumbnailUrl,
      category: t.category,
      // content được validate bằng presentationSchema tại thời điểm seed
      content: t.content as unknown as Presentation,
    };
  }
}
