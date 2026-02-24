import { Module } from '@nestjs/common';
import { EasypanelService } from './easypanel.service';

@Module({
  providers: [EasypanelService],
  exports: [EasypanelService],
})
export class EasypanelModule {}
