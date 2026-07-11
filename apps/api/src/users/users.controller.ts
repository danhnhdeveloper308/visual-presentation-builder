import { Body, Controller, Patch, Post } from '@nestjs/common';
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from '@repo/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser, type RequestUser } from '../rbac/decorators/current-user.decorator';
import { UsersService } from './users.service';

/** Self-service tài khoản — chỉ tác động lên chính user đang đăng nhập, không cần permission riêng. */
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Patch('me')
  updateProfile(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileInput,
  ) {
    return this.users.updateProfile(user.id, body);
  }

  @Post('me/password')
  changePassword(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordInput,
  ) {
    return this.users.changePassword(user.id, user.sessionId, body);
  }
}
