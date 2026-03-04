import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { ApifyService } from './apify.service';
import { PrismaService } from '../../prisma.service';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsappModule],
  controllers: [LeadsController],
  providers: [LeadsService, ApifyService, PrismaService, CompanyAccessGuard],
})
export class LeadsModule {}
