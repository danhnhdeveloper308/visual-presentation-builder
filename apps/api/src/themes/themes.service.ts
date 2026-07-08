import { Injectable } from '@nestjs/common';
import type { Theme } from '@prisma/client';
import type { ThemeConfig, ThemeDto } from '@repo/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ThemesService {
  constructor(private readonly prisma: PrismaService) {}

  async listSystem(): Promise<ThemeDto[]> {
    const themes = await this.prisma.theme.findMany({
      where: { isSystemTheme: true },
      orderBy: { createdAt: 'asc' },
    });
    return themes.map((t) => this.toDto(t));
  }

  private toDto(t: Theme): ThemeDto {
    return {
      id: t.id,
      name: t.name,
      // config validate bằng themeConfigSchema tại thời điểm seed
      config: t.config as unknown as ThemeConfig,
      isSystemTheme: t.isSystemTheme,
    };
  }
}
