import { Controller, Get, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('expiring')
  async getExpiring(@Request() req: any) {
    // Attempt to get companyId from header first (frontend context)
    const companyId = req.headers['x-company-id'];
    
    // If not in header, maybe in user object? (implementation specific)
    // For now strict on header or fallback if user object has it.
    // Let's assume the frontend will send it as it does for other dashboard data usually.
    
    if (!companyId) {
       throw new BadRequestException('Company ID header (x-company-id) is required');
    }

    return this.notificationsService.getExpiringServices(companyId as string);
  }
}
