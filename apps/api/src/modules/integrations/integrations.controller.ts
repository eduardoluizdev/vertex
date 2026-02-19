import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { UpdateIntegrationsDto } from './dto/update-integrations.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('integrations')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'integrations', version: '1' })
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all integration settings (API keys masked)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns current integration settings per provider',
  })
  async getIntegrations() {
    return this.integrationsService.getIntegrations();
  }

  @Patch(':provider')
  @ApiOperation({ summary: 'Update settings for a given provider' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Integration settings updated',
  })
  updateIntegrations(
    @Param('provider') provider: string,
    @Body() dto: UpdateIntegrationsDto,
  ) {
    return this.integrationsService.updateIntegrations(provider, dto);
  }

  @Post(':provider/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test connection for a given provider' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns connection test result',
  })
  testIntegration(@Param('provider') provider: string) {
    if (provider === 'resend') {
      return this.integrationsService.testResendConnection();
    }
    return { success: false, message: `Teste não implementado para "${provider}".` };
  }
}
