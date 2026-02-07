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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('services')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'companies/:companyId/services', version: '1' })
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Service created' })
  create(
    @Param('companyId') companyId: string,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.servicesService.create(companyId, createServiceDto);
  }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'List all services of a company' })
  findAll(@Param('companyId') companyId: string) {
    return this.servicesService.findAll(companyId);
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Get service by ID' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service not found' })
  findOne(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.servicesService.findOne(companyId, id);
  }

  @Patch(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Service updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service not found' })
  update(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(companyId, id, updateServiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Service deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service not found' })
  remove(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.servicesService.remove(companyId, id);
  }
}
