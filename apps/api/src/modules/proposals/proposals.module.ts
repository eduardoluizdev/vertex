import { Module } from '@nestjs/common';
import { ProposalsController } from './proposals.controller';
import { PublicProposalsController } from './public-proposals.controller';
import { ProposalsService } from './proposals.service';
import { PrismaService } from '../../prisma.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsappModule],
  controllers: [ProposalsController, PublicProposalsController],
  providers: [ProposalsService, PrismaService],
})
export class ProposalsModule {}
