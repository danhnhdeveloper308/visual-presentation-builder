import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import {
  PERMISSIONS,
  createProjectSchema,
  saveProjectSchema,
  updateProjectMetaSchema,
  type CreateProjectInput,
  type SaveProjectInput,
  type UpdateProjectMetaInput,
} from '@repo/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RequirePermission } from '../rbac/decorators/require-permission.decorator';
import { CurrentUser, type RequestUser } from '../rbac/decorators/current-user.decorator';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @RequirePermission(PERMISSIONS.PROJECT_READ)
  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.projects.list(user.id);
  }

  @RequirePermission(PERMISSIONS.PROJECT_CREATE)
  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(createProjectSchema)) body: CreateProjectInput,
  ) {
    return this.projects.create(user.id, body);
  }

  @RequirePermission(PERMISSIONS.PROJECT_READ)
  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.projects.get(user.id, id);
  }

  @RequirePermission(PERMISSIONS.PROJECT_UPDATE)
  @Put(':id/content')
  saveContent(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(saveProjectSchema)) body: SaveProjectInput,
  ) {
    return this.projects.saveContent(user.id, id, body);
  }

  @RequirePermission(PERMISSIONS.PROJECT_UPDATE)
  @Patch(':id')
  updateMeta(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProjectMetaSchema)) body: UpdateProjectMetaInput,
  ) {
    return this.projects.updateMeta(user.id, id, body);
  }

  @RequirePermission(PERMISSIONS.PROJECT_DELETE)
  @Delete(':id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.projects.softDelete(user.id, id);
    return { success: true };
  }
}
