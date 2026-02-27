import { Module } from '@nestjs/common';

import { PrismaService } from '../../prisma.service';
import { MailModule } from '../mail/mail.module';
import { CustomersModule } from '../customers/customers.module';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';

@Module({
  imports: [MailModule, CustomersModule, WhatsappModule],
  controllers: [CampaignsController],
  providers: [CampaignsService, PrismaService, CompanyAccessGuard],
})
export class CampaignsModule {}
