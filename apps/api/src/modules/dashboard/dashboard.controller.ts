import { Controller, Get, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard statistics' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('companies/:companyId/stats')
  @ApiResponse({ status: HttpStatus.OK, description: 'Company dashboard statistics' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Company not found' })
  getCompanyStats(@Param('companyId') companyId: string) {
    return this.dashboardService.getCompanyStats(companyId);
  }
}
