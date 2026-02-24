import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProposalsService } from './proposals.service';

@ApiTags('public-proposals')
@Controller({ path: 'public/proposals', version: '1' })
export class PublicProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Get(':token')
  findByToken(@Param('token') token: string) {
    return this.proposalsService.findByToken(token);
  }

  @Patch(':token/status')
  @HttpCode(HttpStatus.OK)
  updateStatusByToken(
    @Param('token') token: string,
    @Body() body: any,
  ) {
    return this.proposalsService.updateStatusByToken(token, body.status);
  }
}
