import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendLeadWhatsappDto {
  @ApiProperty({ example: 'uuid-of-template' })
  @IsString()
  @IsNotEmpty()
  templateId!: string;
}
