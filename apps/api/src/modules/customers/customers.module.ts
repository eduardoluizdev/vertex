import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { PrismaService } from '../../prisma.service';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, PrismaService, CompanyAccessGuard],
  exports: [CustomersService],
})
export class CustomersModule {}
