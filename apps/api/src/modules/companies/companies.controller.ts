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
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('companies')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'companies', version: '1' })
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Company created' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already registered' })
  create(@Body() createCompanyDto: CreateCompanyDto, @Request() req: any) {
    return this.companiesService.create(createCompanyDto, req.user.id);
  }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'List all companies' })
  findAll(@Request() req: any) {
    return this.companiesService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Get company by ID' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Company not found' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.companiesService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Company updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Company not found' })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @Request() req: any) {
    return this.companiesService.update(id, updateCompanyDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Company deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Company not found' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.companiesService.remove(id, req.user.id, req.user.role);
  }
}
