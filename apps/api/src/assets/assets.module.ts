import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { R2Service } from './r2.service';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService, R2Service],
})
export class AssetsModule {}
