import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  PERMISSIONS,
  saveAsTemplateSchema,
  updateTemplateSchema,
  type SaveAsTemplateInput,
  type UpdateTemplateInput,
} from '@repo/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RequirePermission } from '../rbac/decorators/require-permission.decorator';
import { CurrentUser, type RequestUser } from '../rbac/decorators/current-user.decorator';
import { TemplatesService } from './templates.service';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  @RequirePermission(PERMISSIONS.TEMPLATE_READ)
  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.templates.listForUser(user.id);
  }

  @RequirePermission(PERMISSIONS.TEMPLATE_READ)
  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.templates.getVisible(user.id, id);
  }

  @RequirePermission(PERMISSIONS.TEMPLATE_CREATE)
  @Post('from-project/:projectId')
  createFromProject(
    @CurrentUser() user: RequestUser,
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(saveAsTemplateSchema)) body: SaveAsTemplateInput,
  ) {
    return this.templates.createFromProject(user.id, projectId, body);
  }

  @RequirePermission(PERMISSIONS.TEMPLATE_CREATE)
  @Post(':id/duplicate')
  duplicate(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.templates.duplicate(user.id, id);
  }

  @RequirePermission(PERMISSIONS.TEMPLATE_UPDATE)
  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTemplateSchema)) body: UpdateTemplateInput,
  ) {
    return this.templates.update(user.id, id, body);
  }

  @RequirePermission(PERMISSIONS.TEMPLATE_DELETE)
  @Delete(':id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.templates.remove(user.id, id);
    return { success: true };
  }

  @RequirePermission(PERMISSIONS.TEMPLATE_READ)
  @Post(':id/favorite')
  async favorite(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.templates.setFavorite(user.id, id, true);
    return { success: true };
  }

  @RequirePermission(PERMISSIONS.TEMPLATE_READ)
  @Delete(':id/favorite')
  async unfavorite(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.templates.setFavorite(user.id, id, false);
    return { success: true };
  }
}
