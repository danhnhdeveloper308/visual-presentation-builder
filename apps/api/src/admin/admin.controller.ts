import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  PERMISSIONS,
  setUserLockSchema,
  setUserQuotaSchema,
  type SetUserLockInput,
  type SetUserQuotaInput,
} from '@repo/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RequirePermission } from '../rbac/decorators/require-permission.decorator';
import { CurrentUser, type RequestUser } from '../rbac/decorators/current-user.decorator';
import { AdminService } from './admin.service';

/** Trang quản trị — chỉ role admin (permission user:manage). */
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @RequirePermission(PERMISSIONS.USER_MANAGE)
  @Get('users')
  listUsers() {
    return this.admin.listUsers();
  }

  @RequirePermission(PERMISSIONS.USER_MANAGE)
  @Patch('users/:id/lock')
  async setLock(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(setUserLockSchema)) body: SetUserLockInput,
  ) {
    await this.admin.setLock(user.id, id, body.locked);
    return { success: true };
  }

  @RequirePermission(PERMISSIONS.USER_MANAGE)
  @Patch('users/:id/quota')
  async setQuota(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(setUserQuotaSchema)) body: SetUserQuotaInput,
  ) {
    await this.admin.setQuota(id, body);
    return { success: true };
  }
}
