import { Controller, Get } from '@nestjs/common';
import { PERMISSIONS } from '@repo/shared';
import { RequirePermission } from '../rbac/decorators/require-permission.decorator';
import { ThemesService } from './themes.service';

@Controller('themes')
export class ThemesController {
  constructor(private readonly themes: ThemesService) {}

  @RequirePermission(PERMISSIONS.THEME_READ)
  @Get()
  list() {
    return this.themes.listSystem();
  }
}
