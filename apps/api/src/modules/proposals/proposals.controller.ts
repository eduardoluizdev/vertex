import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProposalsService } from './proposals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('proposals')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'companies/:companyId/proposals', version: '1' })
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  create(
    @Param('companyId') companyId: string,
    @Body() dto: any,
  ) {
    return this.proposalsService.create(companyId, dto);
  }

  @Get()
  findAll(
    @Param('companyId') companyId: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('followUpDate') followUpDate?: string,
  ) {
    return this.proposalsService.findAll(companyId, {
      customerId,
      status,
      followUpDate,
    });
  }

  @Get('follow-up/today')
  findFollowUpToday(@Param('companyId') companyId: string) {
    return this.proposalsService.findFollowUpToday(companyId);
  }

  @Get('whatsapp-template')
  getWhatsappTemplate(@Param('companyId') companyId: string) {
    return this.proposalsService.getWhatsappTemplate(companyId);
  }

  @Put('whatsapp-template')
  upsertWhatsappTemplate(
    @Param('companyId') companyId: string,
    @Body() body: any,
  ) {
    return this.proposalsService.upsertWhatsappTemplate(
      companyId, 
      body.template, 
      body.followUpTemplate
    );
  }

  @Get('integration')
  getProposalIntegration(@Param('companyId') companyId: string) {
    return this.proposalsService.getProposalIntegration(companyId);
  }

  @Put('integration')
  upsertProposalIntegration(
    @Param('companyId') companyId: string,
    @Body() body: any,
  ) {
    return this.proposalsService.upsertProposalIntegration(companyId, body.webUrl);
  }

  @Get(':id')
  findOne(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.proposalsService.findOne(companyId, id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.proposalsService.updateStatus(companyId, id, body.status);
  }

  @Patch(':id')
  update(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.proposalsService.update(companyId, id, dto);
  }

  @Post(':id/send-whatsapp')
  @HttpCode(HttpStatus.OK)
  sendWhatsapp(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.proposalsService.sendWhatsapp(companyId, id);
  }

  @Post(':id/send-whatsapp-followup')
  @HttpCode(HttpStatus.OK)
  sendWhatsappFollowup(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.proposalsService.sendWhatsapp(companyId, id, true);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.proposalsService.remove(companyId, id);
  }
}
