import { Module } from '@nestjs/common';
import { ProposalsController } from './proposals.controller';
import { PublicProposalsController } from './public-proposals.controller';
import { ProposalsService } from './proposals.service';
import { PrismaService } from '../../prisma.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { EasypanelModule } from '../easypanel/easypanel.module';

@Module({
  imports: [WhatsappModule, EasypanelModule],
  controllers: [ProposalsController, PublicProposalsController],
  providers: [ProposalsService, PrismaService],
})
export class ProposalsModule {}
