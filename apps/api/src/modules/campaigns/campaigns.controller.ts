import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('campaigns')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller({ path: 'companies/:companyId/campaigns', version: '1' })
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  create(@Param('companyId') companyId: string, @Body() createCampaignDto: any) {
    return this.campaignsService.create(companyId, createCampaignDto);
  }

  @Get()
  findAll(@Param('companyId') companyId: string) {
    return this.campaignsService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('companyId') companyId: string, @Param('id') id: string) {
    return this.campaignsService.findOne(companyId, id);
  }

  @Patch(':id')
  update(@Param('companyId') companyId: string, @Param('id') id: string, @Body() updateCampaignDto: any) {
    return this.campaignsService.update(companyId, id, updateCampaignDto);
  }

  @Delete(':id')
  remove(@Param('companyId') companyId: string, @Param('id') id: string) {
    return this.campaignsService.remove(companyId, id);
  }

  @Post(':id/send')
  send(@Param('companyId') companyId: string, @Param('id') id: string) {
    return this.campaignsService.sendCampaign(companyId, id);
  }
}
