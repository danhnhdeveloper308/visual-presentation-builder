import { Module } from '@nestjs/common';
import { AssetsModule } from '../assets/assets.module';
import { ProjectsController } from './projects.controller';
import { PublicController } from './public.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [AssetsModule],
  controllers: [ProjectsController, PublicController],
  providers: [ProjectsService],
  // ProjectsService dùng lại ở TemplatesModule cho "Lưu làm template" (đọc content + ownership check)
  exports: [ProjectsService],
})
export class ProjectsModule {}
