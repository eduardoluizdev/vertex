import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('whatsapp')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'whatsapp', version: '1' })
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('instance/:companyId')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Instance created' })
  createInstance(@Param('companyId') companyId: string) {
    return this.whatsappService.createInstance(companyId);
  }

  @Get('instance/:companyId')
  @ApiResponse({ status: HttpStatus.OK, description: 'Get instance connection state' })
  getConnectionState(@Param('companyId') companyId: string) {
    return this.whatsappService.getConnectionState(companyId);
  }

  @Get('instance/:companyId/refresh')
  @ApiResponse({ status: HttpStatus.OK, description: 'Force refresh QR Code' })
  refreshQRCode(@Param('companyId') companyId: string) {
    return this.whatsappService.refreshQRCode(companyId);
  }

  @Delete('instance/:companyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Instance deleted' })
  deleteInstance(@Param('companyId') companyId: string) {
    return this.whatsappService.deleteInstance(companyId);
  }
}
