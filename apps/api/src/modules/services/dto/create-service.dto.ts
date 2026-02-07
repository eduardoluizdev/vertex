import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum Recurrence {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreateServiceDto {
  @ApiProperty({ example: 'Consultoria' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Serviço de consultoria empresarial' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  price!: number;

  @ApiProperty({ enum: Recurrence, example: 'MONTHLY' })
  @IsEnum(Recurrence)
  recurrence!: Recurrence;

  @ApiPropertyOptional({
    example: ['uuid-customer-1', 'uuid-customer-2'],
    description: 'IDs dos clientes vinculados ao serviço',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  customerIds?: string[];
}
