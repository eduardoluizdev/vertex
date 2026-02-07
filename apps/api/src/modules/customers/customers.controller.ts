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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('customers')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'companies/:companyId/customers', version: '1' })
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Customer created' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already registered' })
  create(
    @Param('companyId') companyId: string,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return this.customersService.create(companyId, createCustomerDto);
  }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'List all customers of a company' })
  findAll(@Param('companyId') companyId: string) {
    return this.customersService.findAll(companyId);
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Get customer by ID' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Customer not found' })
  findOne(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.findOne(companyId, id);
  }

  @Patch(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Customer updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Customer not found' })
  update(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(companyId, id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Customer deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Customer not found' })
  remove(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.remove(companyId, id);
  }
}
