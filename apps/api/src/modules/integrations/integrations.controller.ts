import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
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
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';

@ApiTags('integrations')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
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

  @Delete(':provider')
  @ApiOperation({ summary: 'Remove a configured integration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Integration removed successfully',
  })
  removeIntegration(
    @Param('provider') provider: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.integrationsService.removeIntegration(provider, companyId);
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
    if (provider === 'asaas') {
      return this.integrationsService.testAsaasConnection(companyId);
    }
    if (provider === 'abacatepay') {
      return this.integrationsService.testAbacatePayConnection(companyId);
    }
    return { success: false, message: `Teste não implementado para "${provider}".` };
  }

  // ─── Domain Management ───────────────────────────────────────────────────────

  @Post('domain')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a custom email domain in Resend for the company' })
  createDomain(
    @Body() body: { domain: string },
    @Query('companyId') companyId: string,
  ) {
    return this.integrationsService.createDomain(companyId, body.domain);
  }

  @Get('domain')
  @ApiOperation({ summary: 'Get domain status and DNS records for the company' })
  getDomainStatus(@Query('companyId') companyId: string) {
    return this.integrationsService.getDomainStatus(companyId);
  }

  @Post('domain/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger domain verification in Resend' })
  verifyDomain(@Query('companyId') companyId: string) {
    return this.integrationsService.verifyDomain(companyId);
  }

  @Delete('domain')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove the custom domain from Resend for the company' })
  deleteDomain(@Query('companyId') companyId: string) {
    return this.integrationsService.deleteDomain(companyId);
  }
}
