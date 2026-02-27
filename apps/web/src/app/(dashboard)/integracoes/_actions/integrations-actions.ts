'use server';

import { apiClient } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export interface IntegrationsData {
  resend: {
    name: string;
    provider: string;
    enabled: boolean;
    apiKey: string;
    frontendUrl: string;
    fromEmail: string;
    isConfigured: boolean;
  };
  asaas?: {
    name: string;
    provider: string;
    enabled: boolean;
    apiKey: string;
    isConfigured: boolean;
    isSandbox: boolean;
  };
  abacatepay?: {
    name: string;
    provider: string;
    enabled: boolean;
    apiKey: string;
    isConfigured: boolean;
    isSandbox: boolean;
  };
  githubOauth?: {
    name: string;
    provider: string;
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    isConfigured: boolean;
  };
}

export interface TestResult {
  success: boolean;
  message: string;
}

export async function getIntegrations(companyId?: string): Promise<IntegrationsData | null> {
  try {
    const url = companyId ? `/v1/integrations?companyId=${companyId}` : `/v1/integrations`;
    const response = await apiClient(url, {
      cache: 'no-store',
    } as RequestInit);

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function updateResendIntegration(
  companyId: string | undefined,
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
  data?: IntegrationsData;
}> {
  const apiKey = formData.get('resendApiKey') as string | null;
  const frontendUrl = formData.get('frontendUrl') as string | null;
  const fromEmail = formData.get('fromEmail') as string | null;

  // Build the config patch — only include non-empty fields
  const config: Record<string, string> = {};
  if (apiKey?.trim()) config.apiKey = apiKey.trim();
  if (frontendUrl?.trim()) config.frontendUrl = frontendUrl.trim();
  if (fromEmail?.trim()) config.fromEmail = fromEmail.trim();

  if (Object.keys(config).length === 0) {
    return { success: false, message: 'Nenhuma alteração detectada.' };
  }

  try {
    // PATCH /v1/integrations/resend  — provider slug in the URL
    const url = companyId ? `/v1/integrations/resend?companyId=${companyId}` : `/v1/integrations/resend`;
    const response = await apiClient(url, {
      method: 'PATCH',
      body: JSON.stringify({ config }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        success: false,
        message:
          (err as { message?: string }).message ?? 'Erro ao salvar configurações.',
      };
    }

    const data = await response.json();
    revalidatePath('/integracoes');
    return { success: true, message: 'Configurações salvas com sucesso!', data };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function testResendConnection(companyId?: string): Promise<TestResult> {
  try {
    // POST /v1/integrations/resend/test
    const url = companyId ? `/v1/integrations/resend/test?companyId=${companyId}` : `/v1/integrations/resend/test`;
    const response = await apiClient(url, {
      method: 'POST',
    });

    if (!response.ok) {
      return { success: false, message: 'Erro ao testar conexão com Resend.' };
    }

    return response.json();
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function updateAsaasIntegration(
  companyId: string | undefined,
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
  data?: IntegrationsData;
}> {
  const apiKey = formData.get('asaasApiKey') as string | null;
  const isSandbox = formData.get('asaasIsSandbox') === 'on';

  const config: Record<string, any> = {};
  if (apiKey?.trim()) config.apiKey = apiKey.trim();
  config.isSandbox = isSandbox;

  if (Object.keys(config).length === 0) {
    return { success: false, message: 'Nenhuma alteração detectada.' };
  }

  try {
    const url = companyId ? `/v1/integrations/asaas?companyId=${companyId}` : `/v1/integrations/asaas`;
    const response = await apiClient(url, {
      method: 'PATCH',
      body: JSON.stringify({ config }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        success: false,
        message:
          (err as { message?: string }).message ?? 'Erro ao salvar configurações.',
      };
    }

    const data = await response.json();
    revalidatePath('/integracoes');
    return { success: true, message: 'Configurações salvas com sucesso!', data };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function testAsaasConnection(companyId?: string): Promise<TestResult> {
  try {
    const url = companyId ? `/v1/integrations/asaas/test?companyId=${companyId}` : `/v1/integrations/asaas/test`;
    const response = await apiClient(url, {
      method: 'POST',
    });

    if (!response.ok) {
      return { success: false, message: 'Erro ao testar conexão com Asaas.' };
    }

    return response.json();
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function updateAbacatePayIntegration(
  companyId: string | undefined,
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
  data?: IntegrationsData;
}> {
  const apiKey = formData.get('abacatePayApiKey') as string | null;
  const isSandbox = formData.get('abacatePayIsSandbox') === 'on';

  const config: Record<string, any> = {};
  if (apiKey?.trim()) config.apiKey = apiKey.trim();
  config.isSandbox = isSandbox;

  if (Object.keys(config).length === 0) {
    return { success: false, message: 'Nenhuma alteração detectada.' };
  }

  try {
    const url = companyId ? `/v1/integrations/abacatepay?companyId=${companyId}` : `/v1/integrations/abacatepay`;
    const response = await apiClient(url, {
      method: 'PATCH',
      body: JSON.stringify({ config }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        success: false,
        message:
          (err as { message?: string }).message ?? 'Erro ao salvar configurações.',
      };
    }

    const data = await response.json();
    revalidatePath('/integracoes');
    return { success: true, message: 'Configurações salvas com sucesso!', data };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function testAbacatePayConnection(companyId?: string): Promise<TestResult> {
  try {
    const url = companyId ? `/v1/integrations/abacatepay/test?companyId=${companyId}` : `/v1/integrations/abacatepay/test`;
    const response = await apiClient(url, {
      method: 'POST',
    });

    if (!response.ok) {
      return { success: false, message: 'Erro ao testar conexão com AbacatePay.' };
    }

    return response.json();
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function removeIntegrationAction(provider: string, companyId?: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = companyId ? `/v1/integrations/${provider}?companyId=${companyId}` : `/v1/integrations/${provider}`;
    const response = await apiClient(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return {
            success: false,
            message: (err as { message?: string }).message ?? `Erro ao remover integração ${provider}.`,
        };
    }

    revalidatePath('/integracoes');
    return { success: true, message: 'Integração removida com sucesso!' };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function updateGoogleAnalyticsIntegration(
  companyId: string | undefined, // Note: GA is typically global (companyId is undefined), but keeping signature for consistency
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
  data?: IntegrationsData;
}> {
  const trackingId = formData.get('trackingId') as string | null;
  const enabled = formData.get('enabled') === 'true';

  const config: Record<string, any> = {};
  if (trackingId?.trim()) config.trackingId = trackingId.trim();

  if (Object.keys(config).length === 0) {
    return { success: false, message: 'Nenhuma alteração detectada.' };
  }

  try {
    const url = companyId ? `/v1/integrations/googleAnalytics?companyId=${companyId}` : `/v1/integrations/googleAnalytics`;
    const response = await apiClient(url, {
      method: 'PATCH',
      body: JSON.stringify({ config, enabled }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        success: false,
        message:
          (err as { message?: string }).message ?? 'Erro ao salvar configurações.',
      };
    }

    const data = await response.json();
    revalidatePath('/integracoes');
    revalidatePath('/', 'layout'); // revalidate layout to apply GA globally
    return { success: true, message: 'Configurações salvas com sucesso!', data };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function updateGithubOauthIntegration(
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
  data?: IntegrationsData;
}> {
  const clientId = formData.get('githubClientId') as string | null;
  const clientSecret = formData.get('githubClientSecret') as string | null;

  const config: Record<string, string> = {};
  if (clientId?.trim()) config.clientId = clientId.trim();
  if (clientSecret?.trim()) config.clientSecret = clientSecret.trim();

  if (Object.keys(config).length === 0) {
    return { success: false, message: 'Nenhuma alteração detectada.' };
  }

  try {
    const url = `/v1/integrations/githubOauth`;
    const response = await apiClient(url, {
      method: 'PATCH',
      body: JSON.stringify({ config }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        success: false,
        message:
          (err as { message?: string }).message ?? 'Erro ao salvar configurações.',
      };
    }

    const data = await response.json();
    revalidatePath('/integracoes');
    return { success: true, message: 'Configurações salvas com sucesso!', data };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}
