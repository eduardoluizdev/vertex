import { Module } from '@nestjs/common';
import { WhatsappTemplatesController } from './whatsapp-templates.controller';
import { WhatsappTemplatesService } from './whatsapp-templates.service';
import { PrismaService } from '../../prisma.service';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';

@Module({
  controllers: [WhatsappTemplatesController],
  providers: [WhatsappTemplatesService, PrismaService, CompanyAccessGuard],
  exports: [WhatsappTemplatesService],
})
export class WhatsappTemplatesModule {}
