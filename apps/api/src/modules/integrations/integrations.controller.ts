import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
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
  async getIntegrations(@Query('companyId') companyId?: string) {
    return this.integrationsService.getIntegrations(companyId);
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
    @Query('companyId') companyId?: string,
  ) {
    return this.integrationsService.updateIntegrations(provider, dto, companyId);
  }

  @Post(':provider/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test connection for a given provider' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns connection test result',
  })
  testIntegration(
    @Param('provider') provider: string,
    @Query('companyId') companyId?: string,
  ) {
    if (provider === 'resend') {
      return this.integrationsService.testResendConnection(companyId);
    }
    return { success: false, message: `Teste não implementado para "${provider}".` };
  }
}
