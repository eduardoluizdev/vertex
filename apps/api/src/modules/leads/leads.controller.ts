import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadListDto } from './dto/create-lead-list.dto';
import { UpdateLeadStageDto } from './dto/update-lead-stage.dto';
import { SendLeadWhatsappDto } from './dto/send-lead-whatsapp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';

@ApiTags('leads')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller({ path: 'companies/:companyId/lead-lists', version: '1' })
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Lead list created and processing started' })
  create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateLeadListDto,
  ) {
    return this.leadsService.createLeadList(companyId, dto);
  }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'List all lead lists for a company' })
  findAll(@Param('companyId') companyId: string) {
    return this.leadsService.findAll(companyId);
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Get lead list with all leads' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead list not found' })
  findOne(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.leadsService.findOne(companyId, id);
  }

  @Patch('leads/:leadId/stage')
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead stage updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead not found' })
  updateStage(
    @Param('companyId') companyId: string,
    @Param('leadId') leadId: string,
    @Body() dto: UpdateLeadStageDto,
  ) {
    return this.leadsService.updateLeadStage(companyId, leadId, dto.stage);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Lead list deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead list not found' })
  remove(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.leadsService.remove(companyId, id);
  }

  @Post('leads/:leadId/send-whatsapp')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'WhatsApp message sent' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead or template not found' })
  sendWhatsapp(
    @Param('companyId') companyId: string,
    @Param('leadId') leadId: string,
    @Body() dto: SendLeadWhatsappDto,
  ) {
    return this.leadsService.sendLeadWhatsapp(companyId, leadId, dto.templateId);
  }
}
