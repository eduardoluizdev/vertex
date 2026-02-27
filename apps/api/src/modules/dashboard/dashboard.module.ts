import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma.service';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService, CompanyAccessGuard],
})
export class DashboardModule {}
