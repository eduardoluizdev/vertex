import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WhatsappTemplateCategory {
  LEAD = 'LEAD',
  PROPOSTA_CRIADA = 'PROPOSTA_CRIADA',
  PROPOSTA_ACEITA = 'PROPOSTA_ACEITA',
  CAMPANHA = 'CAMPANHA',
}

export class CreateTemplateDto {
  @ApiProperty({ example: 'Primeiro contato' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Olá #NOME#, vi que você tem uma empresa de #NICHO#...' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ enum: WhatsappTemplateCategory })
  @IsEnum(WhatsappTemplateCategory)
  category!: WhatsappTemplateCategory;
}
