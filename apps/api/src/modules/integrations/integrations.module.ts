import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { PublicIntegrationsController } from './public-integrations.controller';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [IntegrationsController, PublicIntegrationsController],
  providers: [IntegrationsService, PrismaService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}

