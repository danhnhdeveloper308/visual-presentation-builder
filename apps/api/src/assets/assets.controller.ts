import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  PERMISSIONS,
  confirmAssetSchema,
  presignAssetSchema,
  type ConfirmAssetInput,
  type PresignAssetInput,
} from '@repo/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RequirePermission } from '../rbac/decorators/require-permission.decorator';
import { CurrentUser, type RequestUser } from '../rbac/decorators/current-user.decorator';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @RequirePermission(PERMISSIONS.ASSET_CREATE)
  @Post('presign')
  presign(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(presignAssetSchema)) body: PresignAssetInput,
  ) {
    return this.assets.presign(user.id, body);
  }

  @RequirePermission(PERMISSIONS.ASSET_CREATE)
  @Post('confirm')
  confirm(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(confirmAssetSchema)) body: ConfirmAssetInput,
  ) {
    return this.assets.confirm(user.id, body);
  }

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.assets.list(user.id);
  }

  @RequirePermission(PERMISSIONS.ASSET_DELETE)
  @Delete(':id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.assets.remove(user.id, id);
    return { success: true };
  }
}
