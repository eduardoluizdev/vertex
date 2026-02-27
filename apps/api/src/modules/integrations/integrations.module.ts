import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { PublicIntegrationsController } from './public-integrations.controller';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../../prisma.service';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';

@Module({
  controllers: [IntegrationsController, PublicIntegrationsController],
  providers: [IntegrationsService, PrismaService, CompanyAccessGuard],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}

