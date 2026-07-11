import { Injectable, NotFoundException } from '@nestjs/common';
import type { Theme } from '@prisma/client';
import type { CreateThemeInput, ThemeConfig, ThemeDto, UpdateThemeInput } from '@repo/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ThemesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Theme hệ thống + theme riêng của user — dùng cho ThemePicker trong editor lẫn trang quản lý. */
  async listForUser(userId: string): Promise<ThemeDto[]> {
    const themes = await this.prisma.theme.findMany({
      where: { OR: [{ isSystemTheme: true }, { createdBy: userId }] },
      orderBy: [{ isSystemTheme: 'desc' }, { createdAt: 'asc' }],
    });
    return themes.map((t) => this.toDto(t));
  }

  async create(userId: string, input: CreateThemeInput): Promise<ThemeDto> {
    const theme = await this.prisma.theme.create({
      data: {
        name: input.name,
        config: input.config as unknown as object,
        isSystemTheme: false,
        createdBy: userId,
      },
    });
    return this.toDto(theme);
  }

  /** Nhân bản 1 theme BẤT KỲ (hệ thống hoặc của người khác thấy được) thành theme riêng mới. */
  async clone(userId: string, id: string): Promise<ThemeDto> {
    const source = await this.prisma.theme.findFirst({
      where: { id, OR: [{ isSystemTheme: true }, { createdBy: userId }] },
    });
    if (!source) throw new NotFoundException('Không tìm thấy theme');
    const cloned = await this.prisma.theme.create({
      data: {
        name: `${source.name} (bản sao)`,
        config: source.config as object,
        isSystemTheme: false,
        createdBy: userId,
      },
    });
    return this.toDto(cloned);
  }

  async update(userId: string, id: string, input: UpdateThemeInput): Promise<ThemeDto> {
    const { count } = await this.prisma.theme.updateMany({
      where: { id, createdBy: userId, isSystemTheme: false },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.config !== undefined ? { config: input.config as unknown as object } : {}),
      },
    });
    if (count === 0) throw new NotFoundException('Không tìm thấy theme của bạn');
    const theme = await this.prisma.theme.findUniqueOrThrow({ where: { id } });
    return this.toDto(theme);
  }

  async remove(userId: string, id: string): Promise<void> {
    const { count } = await this.prisma.theme.deleteMany({
      where: { id, createdBy: userId, isSystemTheme: false },
    });
    if (count === 0) throw new NotFoundException('Không tìm thấy theme của bạn');
  }

  private toDto(t: Theme): ThemeDto {
    return {
      id: t.id,
      name: t.name,
      // config validate bằng themeConfigSchema tại thời điểm ghi (seed hoặc create/update DTO)
      config: t.config as unknown as ThemeConfig,
      isSystemTheme: t.isSystemTheme,
      createdBy: t.createdBy,
    };
  }
}
