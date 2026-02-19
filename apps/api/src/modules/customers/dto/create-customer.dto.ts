import { IsString, IsEmail, IsOptional, IsEnum, IsArray, IsInt, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

  enum PersonType {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY',
}

export class SubscriptionDto {
  @ApiProperty({ example: 'uuid-service-1' })
  @IsString()
  serviceId!: string;

  @ApiProperty({ example: 5, description: 'Day of the month for recurrence' })
  @IsInt()
  @Min(1)
  @Max(31)
  recurrenceDay!: number;

  @ApiPropertyOptional({ example: 1, description: 'Month for yearly recurrence (1-12)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  recurrenceMonth?: number;
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'joao@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '01001-000' })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional({ example: 'Rua Exemplo' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: 'Centro' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({ example: '123' })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({ example: 'Sala 1' })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiPropertyOptional({ example: 'São Paulo' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '123.456.789-00' })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiProperty({ enum: PersonType, example: 'INDIVIDUAL' })
  @IsEnum(PersonType)
  personType!: PersonType;

  @ApiPropertyOptional({ example: 'uuid-of-user' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ type: [SubscriptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionDto)
  subscriptions?: SubscriptionDto[];
}
