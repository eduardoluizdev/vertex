import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { WhatsappTemplatesService } from './whatsapp-templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';

@ApiTags('whatsapp-templates')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller({ path: 'companies/:companyId/whatsapp-templates', version: '1' })
export class WhatsappTemplatesController {
  constructor(private readonly service: WhatsappTemplatesService) {}

  @Get()
  @ApiQuery({ name: 'category', required: false })
  findAll(
    @Param('companyId') companyId: string,
    @Query('category') category?: string,
  ) {
    return this.service.findAll(companyId, category);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.service.create(companyId, dto);
  }

  @Put(':id')
  update(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateTemplateDto>,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Post('ai/generate')
  @HttpCode(HttpStatus.OK)
  generateContent(
    @Param('companyId') companyId: string,
    @Body() body: { name: string; category: string; context?: string },
  ) {
    return this.service.generateContent(companyId, body.category, body.name, body.context);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(companyId, id);
  }
}
