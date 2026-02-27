import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';

@ApiTags('public-integrations')
@Controller({ path: 'public/integrations', version: '1' })
export class PublicIntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('google-analytics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get global Google Analytics tracking ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the tracking ID if configured',
  })
  async getGoogleAnalytics() {
    return this.integrationsService.getPublicGoogleAnalytics();
  }
}
