import { Controller, Get, Param } from '@nestjs/common';
import { PERMISSIONS } from '@repo/shared';
import { RequirePermission } from '../rbac/decorators/require-permission.decorator';
import { TemplatesService } from './templates.service';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  @RequirePermission(PERMISSIONS.TEMPLATE_READ)
  @Get()
  list() {
    return this.templates.list();
  }

  @RequirePermission(PERMISSIONS.TEMPLATE_READ)
  @Get(':id')
  get(@Param('id') id: string) {
    return this.templates.getPublic(id);
  }
}
