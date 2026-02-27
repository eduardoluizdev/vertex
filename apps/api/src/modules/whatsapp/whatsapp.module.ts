import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { PrismaService } from '../../prisma.service';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappService, PrismaService, CompanyAccessGuard],
  exports: [WhatsappService],
})
export class WhatsappModule {}
