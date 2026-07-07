import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** User đã xác thực, gắn vào request bởi AuthGuard. */
export type RequestUser = {
  id: string;
  role: string;
  sessionId: string;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const req = ctx.switchToHttp().getRequest<Request & { user: RequestUser }>();
    return req.user;
  },
);
