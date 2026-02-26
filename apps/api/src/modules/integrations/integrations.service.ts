import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { Resend } from 'resend';
import { PrismaService } from '../../prisma.service';
import { UpdateIntegrationsDto } from './dto/update-integrations.dto';

export const RESEND_PROVIDER = 'resend';
export const ASAAS_PROVIDER = 'asaas';
export const ABACATEPAY_PROVIDER = 'abacatepay';

/** Instancia o cliente Resend sempre com a região São Paulo (sa-east-1) */
function createResendClient(apiKey: string): Resend {
  return new Resend(apiKey);
}


/** Shape of the config JSON stored for the Resend provider */
interface ResendConfig {
  apiKey?: string;
  frontendUrl?: string;
  fromEmail?: string;
  domainId?: string;
  domain?: string;
  domainStatus?: 'pending' | 'verified' | 'failed' | 'not_started';
}

interface AsaasConfig {
  apiKey?: string;
  isSandbox?: boolean;
}

interface AbacatePayConfig {
  apiKey?: string;
  isSandbox?: boolean;
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
   * Resend API key is masked. Falls back to env vars when no DB row exists (only for admin).
   */
  async getIntegrations(companyId?: string) {
    const row = await this.prisma.integrationConfig.findFirst({
      where: {
        provider: RESEND_PROVIDER,
        companyId: companyId || null,
      },
    });

    const cfg = (row?.config ?? {}) as ResendConfig;

    // Fallback to env vars if DB value is missing OR empty, but ONLY for admin (companyId is undefined/null)
    const dbApiKey = cfg.apiKey;
    const apiKey = (dbApiKey && dbApiKey.length > 0) ? dbApiKey : (!companyId ? (process.env.RESEND_API_KEY ?? '') : '');
    
    const dbFrontendUrl = cfg.frontendUrl;
    const frontendUrl =
      (dbFrontendUrl && dbFrontendUrl.length > 0) ? dbFrontendUrl : (process.env.FRONTEND_URL ?? 'http://localhost:3000');

    const fromEmail = cfg.fromEmail || 'VertexHub <no-reply@vertexhub.dev>';

    const isConfigured = apiKey.startsWith('re_') && apiKey.length > 10;

    const asaasRow = await this.prisma.integrationConfig.findFirst({
      where: {
        provider: ASAAS_PROVIDER,
        companyId: companyId || null,
      },
    });
    const asaasCfg = (asaasRow?.config ?? {}) as AsaasConfig;
    const asaasApiKey = asaasCfg.apiKey ?? '';
    const isAsaasConfigured = asaasApiKey.length > 5;

    const abacatePayRow = await this.prisma.integrationConfig.findFirst({
      where: {
        provider: ABACATEPAY_PROVIDER,
        companyId: companyId || null,
      },
    });
    const abacatePayCfg = (abacatePayRow?.config ?? {}) as AbacatePayConfig;
    const abacatePayApiKey = abacatePayCfg.apiKey ?? '';
    const isAbacatePayConfigured = abacatePayApiKey.length > 5;

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
      asaas: {
        name: asaasRow?.name ?? 'Asaas',
        provider: ASAAS_PROVIDER,
        enabled: asaasRow?.enabled ?? true,
        apiKey: asaasApiKey,
        isConfigured: isAsaasConfigured,
        isSandbox: asaasCfg.isSandbox ?? false,
      },
      abacatepay: {
        name: abacatePayRow?.name ?? 'AbacatePay',
        provider: ABACATEPAY_PROVIDER,
        enabled: abacatePayRow?.enabled ?? true,
        apiKey: abacatePayApiKey,
        isConfigured: isAbacatePayConfigured,
        isSandbox: abacatePayCfg.isSandbox ?? false,
      }
    };
  }

  /**
   * Upserts the integration config for a given provider.
   * The config JSON is merged (patch semantics) so callers only send changed fields.
   */
  async updateIntegrations(provider: string, dto: UpdateIntegrationsDto, companyId?: string) {
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
    const resolvedCompanyId = companyId || null;
    const existing = await this.prisma.integrationConfig.findFirst({
      where: {
        provider,
        companyId: resolvedCompanyId,
      },
    });
    const existingConfig = (existing?.config ?? {}) as Record<string, unknown>;
    const mergedConfig = { ...existingConfig, ...(dto.config ?? {}) };

    if (existing) {
      await this.prisma.integrationConfig.update({
        where: { id: existing.id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.enabled !== undefined && { enabled: dto.enabled }),
          config: mergedConfig as any,
        },
      });
    } else {
      await this.prisma.integrationConfig.create({
        data: {
          provider,
          companyId: resolvedCompanyId,
          name: dto.name ?? provider,
          config: mergedConfig as any,
          enabled: dto.enabled ?? true,
        },
      });
    }

    this.logger.log(`Integration "${provider}" updated in database`);

    return this.getIntegrations(companyId);
  }

  /**
   * Removes an integration config completely.
   */
  async removeIntegration(provider: string, companyId?: string) {
    const resolvedCompanyId = companyId || null;
    const existing = await this.prisma.integrationConfig.findFirst({
      where: { provider, companyId: resolvedCompanyId },
    });

    if (!existing) {
      throw new NotFoundException(`Integração "${provider}" não encontrada.`);
    }

    await this.prisma.integrationConfig.delete({
      where: { id: existing.id },
    });

    this.logger.log(`Integration "${provider}" removed from database`);
    return { success: true, message: `Integração removida com sucesso.` };
  }

  /**
   * Retrieves the Resend API key for a given company (no fallback to env).
   */
  private async getCompanyResendKey(companyId: string): Promise<string> {
    const row = await this.prisma.integrationConfig.findFirst({
      where: { provider: RESEND_PROVIDER, companyId },
    });
    const cfg = (row?.config ?? {}) as ResendConfig;
    const apiKey = cfg.apiKey ?? '';
    if (!apiKey || !apiKey.startsWith('re_')) {
      throw new BadRequestException(
        'API Key do Resend não configurada para esta empresa. Configure em Integrações → Resend primeiro.',
      );
    }
    return apiKey;
  }

  /**
   * Registers a new domain in Resend for the given company.
   * Stores domainId, domain and domainStatus in the IntegrationConfig JSON.
   */
  async createDomain(companyId: string, domain: string) {
    const apiKey = await this.getCompanyResendKey(companyId);
    const resend = createResendClient(apiKey);

    const { data, error } = await resend.domains.create({ name: domain });
    if (error || !data) {
      throw new BadRequestException(
        `Erro ao cadastrar domínio no Resend: ${error?.message ?? 'resposta inválida'}`,
      );
    }

    // Persist in IntegrationConfig
    const existing = await this.prisma.integrationConfig.findFirst({
      where: { provider: RESEND_PROVIDER, companyId },
    });
    const existingConfig = (existing?.config ?? {}) as Record<string, unknown>;
    const updatedConfig = {
      ...existingConfig,
      domainId: data.id,
      domain: data.name,
      domainStatus: 'pending',
    };

    if (existing) {
      await this.prisma.integrationConfig.update({
        where: { id: existing.id },
        data: { config: updatedConfig as any },
      });
    } else {
      await this.prisma.integrationConfig.create({
        data: {
          provider: RESEND_PROVIDER,
          companyId,
          name: 'Resend',
          config: updatedConfig as any,
          enabled: true,
        },
      });
    }

    // Return records for DNS configuration
    return {
      domainId: data.id,
      domain: data.name,
      status: 'pending',
      records: data.records ?? [],
    };
  }

  /**
   * Fetches the current domain status and DNS records from Resend.
   */
  async getDomainStatus(companyId: string) {
    const row = await this.prisma.integrationConfig.findFirst({
      where: { provider: RESEND_PROVIDER, companyId },
    });
    const cfg = (row?.config ?? {}) as ResendConfig;

    if (!cfg.domainId) {
      return { domain: null, status: 'not_started', records: [] };
    }

    const apiKey = await this.getCompanyResendKey(companyId);
    const resend = createResendClient(apiKey);

    const { data, error } = await resend.domains.get(cfg.domainId);
    if (error || !data) {
      throw new BadRequestException(
        `Erro ao consultar domínio no Resend: ${error?.message ?? 'resposta inválida'}`,
      );
    }

    // Sync status back to DB
    const existingConfig = (row?.config ?? {}) as Record<string, unknown>;
    await this.prisma.integrationConfig.update({
      where: { id: row!.id },
      data: {
        config: { ...existingConfig, domainStatus: data.status } as any,
      },
    });

    return {
      domainId: data.id,
      domain: data.name,
      status: data.status,
      records: data.records ?? [],
    };
  }

  /**
   * Triggers domain verification in Resend.
   */
  async verifyDomain(companyId: string) {
    const row = await this.prisma.integrationConfig.findFirst({
      where: { provider: RESEND_PROVIDER, companyId },
    });
    const cfg = (row?.config ?? {}) as ResendConfig;

    if (!cfg.domainId) {
      throw new NotFoundException('Nenhum domínio cadastrado para esta empresa.');
    }

    const apiKey = await this.getCompanyResendKey(companyId);
    const resend = createResendClient(apiKey);

    const { data, error } = await resend.domains.verify(cfg.domainId);
    if (error) {
      throw new BadRequestException(
        `Erro ao verificar domínio no Resend: ${error.message}`,
      );
    }

    return { ok: true, data };
  }

  /**
   * Deletes the domain from Resend and clears related fields from config.
   */
  async deleteDomain(companyId: string) {
    const row = await this.prisma.integrationConfig.findFirst({
      where: { provider: RESEND_PROVIDER, companyId },
    });
    const cfg = (row?.config ?? {}) as ResendConfig;

    if (!cfg.domainId) {
      throw new NotFoundException('Nenhum domínio cadastrado para esta empresa.');
    }

    const apiKey = await this.getCompanyResendKey(companyId);
    const resend = createResendClient(apiKey);

    await resend.domains.remove(cfg.domainId);

    // Clear domain fields from config
    const existingConfig = (row?.config ?? {}) as Record<string, unknown>;
    const { domainId: _did, domain: _d, domainStatus: _ds, ...rest } = existingConfig as any;
    await this.prisma.integrationConfig.update({
      where: { id: row!.id },
      data: { config: rest as any },
    });

    return { ok: true };
  }

  /**
   * Tests the Resend connection using the key from DB (or env fallback).
   */
  async testResendConnection(companyId?: string): Promise<{ success: boolean; message: string }> {
    const row = await this.prisma.integrationConfig.findFirst({
      where: {
        provider: RESEND_PROVIDER,
        companyId: companyId || null,
      },
    });

    const cfg = (row?.config ?? {}) as ResendConfig;
    const apiKey = cfg.apiKey ?? (!companyId ? (process.env.RESEND_API_KEY ?? '') : '');

    if (!apiKey || !apiKey.startsWith('re_')) {
      return {
        success: false,
        message: 'RESEND_API_KEY não está configurada ou é inválida.',
      };
    }

    try {
      const resend = createResendClient(apiKey);
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

  /**
   * Tests the Asaas connection using the key from DB.
   */
  async testAsaasConnection(companyId?: string): Promise<{ success: boolean; message: string }> {
    const row = await this.prisma.integrationConfig.findFirst({
      where: {
        provider: ASAAS_PROVIDER,
        companyId: companyId || null,
      },
    });

    const cfg = (row?.config ?? {}) as AsaasConfig;
    const apiKey = cfg.apiKey ?? '';
    const isSandbox = cfg.isSandbox ?? false;
    const baseUrl = isSandbox ? 'https://sandbox.asaas.com/api/v3' : 'https://api.asaas.com/v3';

    if (!apiKey) {
      return {
        success: false,
        message: 'API Key do Asaas não está configurada.',
      };
    }

    try {
      const response = await fetch(`${baseUrl}/finance/balance`, {
        headers: {
          access_token: apiKey,
        }
      });

      if (!response.ok) {
        let errorMsg = 'resposta inválida';
        try {
          const errData = await response.json();
          errorMsg = JSON.stringify(errData.errors || errData);
        } catch {}
        this.logger.warn(`Asaas connection test failed: ${errorMsg}`);
        return {
          success: false,
          message: 'Falha na conexão com Asaas. Verifique sua API Key.',
        };
      }

      return {
        success: true,
        message: 'Conexão com Asaas estabelecida com sucesso!',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.logger.error('Error testing Asaas connection', err);
      return {
        success: false,
        message: `Erro ao conectar com Asaas: ${message}`,
      };
    }
  }

  /**
   * Tests the AbacatePay connection using the key from DB.
   */
  async testAbacatePayConnection(companyId?: string): Promise<{ success: boolean; message: string }> {
    const row = await this.prisma.integrationConfig.findFirst({
      where: {
        provider: ABACATEPAY_PROVIDER,
        companyId: companyId || null,
      },
    });

    const cfg = (row?.config ?? {}) as AbacatePayConfig;
    const apiKey = cfg.apiKey ?? '';
    const isSandbox = cfg.isSandbox ?? false;

    if (!apiKey) {
      return {
        success: false,
        message: 'API Key da AbacatePay não está configurada.',
      };
    }

    const baseUrl = 'https://api.abacatepay.com/v1';

    try {
      const response = await fetch(`${baseUrl}/billing/list`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      });

      if (!response.ok) {
        let errorMsg = 'resposta inválida';
        try {
          const errData = await response.json();
          errorMsg = JSON.stringify(errData.error || errData);
        } catch {}
        this.logger.warn(`AbacatePay connection test failed: ${errorMsg}`);
        return {
          success: false, 
          message: 'Falha na conexão com AbacatePay. Verifique sua chave da API.',
        };
      }

      return {
        success: true,
        message: 'Conexão com AbacatePay estabelecida com sucesso!',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error testing AbacatePay connection: ${message}`);
      return {
        success: false,
        message: `Erro ao conectar com AbacatePay: ${message}`,
      };
    }
  }
}

