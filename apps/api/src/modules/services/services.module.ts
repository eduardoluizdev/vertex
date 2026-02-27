import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { PrismaService } from '../../prisma.service';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService, PrismaService, CompanyAccessGuard],
  exports: [ServicesService],
})
export class ServicesModule {}
