import { Controller, Get, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../rbac/decorators/public.decorator';
import { ProjectsService } from './projects.service';

/** Route public — xem presentation qua link share, KHÔNG cần đăng nhập. */
@Controller('public')
export class PublicController {
  constructor(private readonly projects: ProjectsService) {}

  @Public()
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Get('presentations/:token')
  getByToken(@Param('token') token: string) {
    return this.projects.getPublicByToken(token);
  }
}
