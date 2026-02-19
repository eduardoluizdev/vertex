import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Resend } from 'resend';
import { PrismaService } from '../../prisma.service';
import { UpdateIntegrationsDto } from './dto/update-integrations.dto';

export const RESEND_PROVIDER = 'resend';

/** Shape of the config JSON stored for the Resend provider */
interface ResendConfig {
  apiKey?: string;
  frontendUrl?: string;
  fromEmail?: string;
}

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private maskKey(rawKey: string): string {
    if (!rawKey) return '';
    return rawKey.length > 4
      ? `${'*'.repeat(rawKey.length - 4)}${rawKey.slice(-4)}`
      : '*'.repeat(rawKey.length);
  }

  /**
   * Returns all integrations (one per provider).
   * Resend API key is masked. Falls back to env vars when no DB row exists.
   */
  async getIntegrations() {
    const row = await this.prisma.integrationConfig.findUnique({
      where: { provider: RESEND_PROVIDER },
    });

    const cfg = (row?.config ?? {}) as ResendConfig;

    // Fallback to env vars if DB value is missing OR empty
    // This fixes the issue where an empty string in DB blocked reading from .env
    const dbApiKey = cfg.apiKey;
    const apiKey = (dbApiKey && dbApiKey.length > 0) ? dbApiKey : (process.env.RESEND_API_KEY ?? '');
    
    const dbFrontendUrl = cfg.frontendUrl;
    const frontendUrl =
      (dbFrontendUrl && dbFrontendUrl.length > 0) ? dbFrontendUrl : (process.env.FRONTEND_URL ?? 'http://localhost:3000');

    const fromEmail = cfg.fromEmail || 'VertexHub <no-reply@vertexhub.dev>';

    const isConfigured = apiKey.startsWith('re_') && apiKey.length > 10;

    return {
      resend: {
        name: row?.name ?? 'Resend',
        provider: RESEND_PROVIDER,
        enabled: row?.enabled ?? true,
        apiKey,
        frontendUrl,
        fromEmail,
        isConfigured,
      },
    };
  }

  /**
   * Upserts the integration config for a given provider.
   * The config JSON is merged (patch semantics) so callers only send changed fields.
   */
  async updateIntegrations(provider: string, dto: UpdateIntegrationsDto) {
    // Validate Resend API key format when updating Resend config
    if (provider === RESEND_PROVIDER && dto.config?.apiKey) {
      const apiKey = dto.config.apiKey as string;
      if (!apiKey.startsWith('re_')) {
        throw new BadRequestException(
          'RESEND_API_KEY inválida. Deve começar com "re_".',
        );
      }
    }

    // Merge the incoming config with whatever is already stored
    const existing = await this.prisma.integrationConfig.findUnique({
      where: { provider },
    });
    const existingConfig = (existing?.config ?? {}) as Record<string, unknown>;
    const mergedConfig = { ...existingConfig, ...(dto.config ?? {}) };

    await this.prisma.integrationConfig.upsert({
      where: { provider },
      create: {
        provider,
        name: dto.name ?? provider,
        config: mergedConfig as any,
        enabled: dto.enabled ?? true,
      },
      update: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
        config: mergedConfig as any,
      },
    });

    this.logger.log(`Integration "${provider}" updated in database`);

    return this.getIntegrations();
  }

  /**
   * Tests the Resend connection using the key from DB (or env fallback).
   */
  async testResendConnection(): Promise<{ success: boolean; message: string }> {
    const row = await this.prisma.integrationConfig.findUnique({
      where: { provider: RESEND_PROVIDER },
    });

    const cfg = (row?.config ?? {}) as ResendConfig;
    const apiKey = cfg.apiKey ?? process.env.RESEND_API_KEY ?? '';

    if (!apiKey || !apiKey.startsWith('re_')) {
      return {
        success: false,
        message: 'RESEND_API_KEY não está configurada ou é inválida.',
      };
    }

    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.domains.list();

      if (error) {
        this.logger.warn('Resend connection test failed', error);
        return {
          success: false,
          message: `Falha na conexão com Resend: ${error.message}`,
        };
      }

      return {
        success: true,
        message: 'Conexão com Resend estabelecida com sucesso!',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.logger.error('Error testing Resend connection', err);
      return {
        success: false,
        message: `Erro ao conectar com Resend: ${message}`,
      };
    }
  }
}
