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
    isConfigured: boolean;
  };
}

export interface TestResult {
  success: boolean;
  message: string;
}

export async function getIntegrations(): Promise<IntegrationsData | null> {
  try {
    const response = await apiClient('/v1/integrations', {
      cache: 'no-store',
    } as RequestInit);

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function updateResendIntegration(formData: FormData): Promise<{
  success: boolean;
  message: string;
  data?: IntegrationsData;
}> {
  const apiKey = formData.get('resendApiKey') as string | null;
  const frontendUrl = formData.get('frontendUrl') as string | null;

  // Build the config patch — only include non-empty fields
  const config: Record<string, string> = {};
  if (apiKey?.trim()) config.apiKey = apiKey.trim();
  if (frontendUrl?.trim()) config.frontendUrl = frontendUrl.trim();

  if (Object.keys(config).length === 0) {
    return { success: false, message: 'Nenhuma alteração detectada.' };
  }

  try {
    // PATCH /v1/integrations/resend  — provider slug in the URL
    const response = await apiClient('/v1/integrations/resend', {
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

export async function testResendConnection(): Promise<TestResult> {
  try {
    // POST /v1/integrations/resend/test
    const response = await apiClient('/v1/integrations/resend/test', {
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
