import { IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeadListDto {
  @ApiProperty({ example: 'Dentistas SP' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'dentistas' })
  @IsString()
  nicho!: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  cidade!: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  estado!: string;

  @ApiProperty({ example: 'Brasil' })
  @IsString()
  pais!: string;

  @ApiProperty({ example: 20, minimum: 1, maximum: 200 })
  @IsInt()
  @Min(1)
  @Max(200)
  quantidade!: number;
}
