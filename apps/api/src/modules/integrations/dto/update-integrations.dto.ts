import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIntegrationsDto {
  @ApiPropertyOptional({
    description: 'Human-readable name of the integration',
    example: 'Resend',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description:
      'Provider-specific configuration as a key-value object. ' +
      'For Resend: { apiKey: "re_...", frontendUrl: "https://..." }',
    example: { apiKey: 're_xxxx', frontendUrl: 'https://app.vertexhub.dev' },
  })
  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Whether this integration is active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
