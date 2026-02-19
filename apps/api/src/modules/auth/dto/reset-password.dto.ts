import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token recebido por email' })
  @IsString()
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token!: string;

  @ApiProperty({ description: 'Nova senha (mínimo 8 caracteres)', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  password!: string;
}
