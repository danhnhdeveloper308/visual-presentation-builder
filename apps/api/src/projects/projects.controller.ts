import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import {
  PERMISSIONS,
  addCollaboratorSchema,
  createProjectSchema,
  saveProjectSchema,
  updateCollaboratorSchema,
  updateProjectMetaSchema,
  type AddCollaboratorInput,
  type CreateProjectInput,
  type SaveProjectInput,
  type UpdateCollaboratorInput,
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

  // Đặt TRƯỚC ":id" — nếu không "trash" sẽ bị Nest match nhầm vào :id
  @RequirePermission(PERMISSIONS.PROJECT_READ)
  @Get('trash')
  listTrash(@CurrentUser() user: RequestUser) {
    return this.projects.listTrash(user.id);
  }

  // Đặt TRƯỚC ":id" — cùng lý do với "trash"
  @RequirePermission(PERMISSIONS.PROJECT_READ)
  @Get('shared-with-me')
  listShared(@CurrentUser() user: RequestUser) {
    return this.projects.listShared(user.id);
  }

  /* ---------- Share với user (collaborators) ---------- */

  @RequirePermission(PERMISSIONS.PROJECT_READ)
  @Get(':id/collaborators')
  listCollaborators(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.projects.listCollaborators(user.id, id);
  }

  @RequirePermission(PERMISSIONS.PROJECT_UPDATE)
  @Post(':id/collaborators')
  addCollaborator(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(addCollaboratorSchema)) body: AddCollaboratorInput,
  ) {
    return this.projects.addCollaborator(user.id, id, body);
  }

  @RequirePermission(PERMISSIONS.PROJECT_UPDATE)
  @Patch(':id/collaborators/:userId')
  async updateCollaborator(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Body(new ZodValidationPipe(updateCollaboratorSchema)) body: UpdateCollaboratorInput,
  ) {
    await this.projects.updateCollaborator(user.id, id, targetUserId, body);
    return { success: true };
  }

  @RequirePermission(PERMISSIONS.PROJECT_UPDATE)
  @Delete(':id/collaborators/:userId')
  async removeCollaborator(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
  ) {
    await this.projects.removeCollaborator(user.id, id, targetUserId);
    return { success: true };
  }

  /* ---------- Share public bằng link ---------- */

  @RequirePermission(PERMISSIONS.PROJECT_UPDATE)
  @Post(':id/share')
  enableShare(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.projects.enableShare(user.id, id);
  }

  @RequirePermission(PERMISSIONS.PROJECT_UPDATE)
  @Delete(':id/share')
  disableShare(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.projects.disableShare(user.id, id);
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

  @RequirePermission(PERMISSIONS.PROJECT_CREATE)
  @Post(':id/duplicate')
  duplicate(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.projects.duplicate(user.id, id);
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

  @RequirePermission(PERMISSIONS.PROJECT_UPDATE)
  @Post(':id/restore')
  async restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.projects.restore(user.id, id);
    return { success: true };
  }

  @RequirePermission(PERMISSIONS.PROJECT_DELETE)
  @Delete(':id/permanent')
  async removePermanent(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.projects.permanentDelete(user.id, id);
    return { success: true };
  }
}
