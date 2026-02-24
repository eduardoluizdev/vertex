'use server';

import { apiClient } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number | string;
  priority?: number;
}

export interface DomainStatus {
  domainId: string | null;
  domain: string | null;
  status: 'not_started' | 'pending' | 'verified' | 'failed' | string;
  records: DnsRecord[];
}

export async function getDomainStatus(companyId: string): Promise<DomainStatus> {
  try {
    const response = await apiClient(
      `/v1/integrations/domain?companyId=${companyId}`,
      { cache: 'no-store' } as RequestInit,
    );
    if (!response.ok) return { domainId: null, domain: null, status: 'not_started', records: [] };
    return response.json();
  } catch {
    return { domainId: null, domain: null, status: 'not_started', records: [] };
  }
}

export async function createDomain(
  companyId: string,
  domain: string,
): Promise<{ success: boolean; message: string; data?: DomainStatus }> {
  try {
    const response = await apiClient(
      `/v1/integrations/domain?companyId=${companyId}`,
      {
        method: 'POST',
        body: JSON.stringify({ domain }),
      },
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        success: false,
        message: (err as { message?: string }).message ?? 'Erro ao cadastrar domínio.',
      };
    }

    const data = await response.json();
    revalidatePath('/integracoes');
    return { success: true, message: 'Domínio cadastrado! Configure os records DNS abaixo.', data };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function verifyDomain(
  companyId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient(
      `/v1/integrations/domain/verify?companyId=${companyId}`,
      { method: 'POST' },
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        success: false,
        message: (err as { message?: string }).message ?? 'Erro ao verificar domínio.',
      };
    }

    revalidatePath('/integracoes');
    return {
      success: true,
      message: 'Verificação disparada! Aguarde alguns minutos e consulte o status novamente.',
    };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

export async function deleteDomain(
  companyId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient(
      `/v1/integrations/domain?companyId=${companyId}`,
      { method: 'DELETE' },
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        success: false,
        message: (err as { message?: string }).message ?? 'Erro ao remover domínio.',
      };
    }

    revalidatePath('/integracoes');
    return { success: true, message: 'Domínio removido com sucesso.' };
  } catch {
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}
