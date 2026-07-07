import { SetMetadata } from '@nestjs/common';
import type { PermissionAction } from '@repo/shared';

export const PERMISSIONS_KEY = 'requiredPermissions';

/** Yêu cầu user có đủ các permission (format `resource:action`). */
export const RequirePermission = (...permissions: PermissionAction[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
