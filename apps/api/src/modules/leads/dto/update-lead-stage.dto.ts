import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LeadKanbanStage {
  NOVO = 'NOVO',
  CONTATO_INICIAL = 'CONTATO_INICIAL',
  INTERESSADO = 'INTERESSADO',
  PROPOSTA_ENVIADA = 'PROPOSTA_ENVIADA',
  EM_NEGOCIACAO = 'EM_NEGOCIACAO',
  CLIENTE = 'CLIENTE',
  PERDIDO = 'PERDIDO',
}

export class UpdateLeadStageDto {
  @ApiProperty({ enum: LeadKanbanStage })
  @IsEnum(LeadKanbanStage)
  stage!: LeadKanbanStage;
}
