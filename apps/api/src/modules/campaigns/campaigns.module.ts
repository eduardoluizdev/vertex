import { Module } from '@nestjs/common';

import { PrismaService } from '../../prisma.service';
import { MailModule } from '../mail/mail.module';
import { CustomersModule } from '../customers/customers.module';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [MailModule, CustomersModule],
  controllers: [CampaignsController],
  providers: [CampaignsService, PrismaService],
})
export class CampaignsModule {}
