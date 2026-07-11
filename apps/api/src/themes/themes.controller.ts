import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  PERMISSIONS,
  createThemeSchema,
  updateThemeSchema,
  type CreateThemeInput,
  type UpdateThemeInput,
} from '@repo/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RequirePermission } from '../rbac/decorators/require-permission.decorator';
import { CurrentUser, type RequestUser } from '../rbac/decorators/current-user.decorator';
import { ThemesService } from './themes.service';

@Controller('themes')
export class ThemesController {
  constructor(private readonly themes: ThemesService) {}

  @RequirePermission(PERMISSIONS.THEME_READ)
  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.themes.listForUser(user.id);
  }

  @RequirePermission(PERMISSIONS.THEME_CREATE)
  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(createThemeSchema)) body: CreateThemeInput,
  ) {
    return this.themes.create(user.id, body);
  }

  @RequirePermission(PERMISSIONS.THEME_CREATE)
  @Post(':id/clone')
  clone(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.themes.clone(user.id, id);
  }

  @RequirePermission(PERMISSIONS.THEME_UPDATE)
  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateThemeSchema)) body: UpdateThemeInput,
  ) {
    return this.themes.update(user.id, id, body);
  }

  @RequirePermission(PERMISSIONS.THEME_DELETE)
  @Delete(':id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.themes.remove(user.id, id);
    return { success: true };
  }
}
