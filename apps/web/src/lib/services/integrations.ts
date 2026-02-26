import { apiClient } from '@/lib/api';

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
  googleAnalytics?: {
    name: string;
    provider: string;
    enabled: boolean;
    trackingId: string;
    isConfigured: boolean;
  };
}

export async function getIntegrationsServer(companyId?: string): Promise<IntegrationsData | null> {
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

