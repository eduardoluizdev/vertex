'use server';

import { revalidatePath } from 'next/cache';
import { getSelectedCompanyId } from '@/lib/cookies';
import { apiClient } from '@/lib/api';

export async function getProposals(filters?: {
  customerId?: string;
  status?: string;
  followUpDate?: string;
}) {
  const companyId = await getSelectedCompanyId();
  if (!companyId) return [];

  const params = new URLSearchParams();
  if (filters?.customerId) params.set('customerId', filters.customerId);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.followUpDate) params.set('followUpDate', filters.followUpDate);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await apiClient(`/v1/companies/${companyId}/proposals${query}`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getProposal(id: string) {
  const companyId = await getSelectedCompanyId();
  if (!companyId) return null;

  const res = await apiClient(`/v1/companies/${companyId}/proposals/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getFollowUpToday() {
  const companyId = await getSelectedCompanyId();
  if (!companyId) return [];

  const res = await apiClient(
    `/v1/companies/${companyId}/proposals/follow-up/today`,
    { cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json();
}

export async function createProposal(data: any) {
  const companyId = await getSelectedCompanyId();
  if (!companyId) throw new Error('Empresa não selecionada');

  const res = await apiClient(`/v1/companies/${companyId}/proposals`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao criar proposta: ${err}`);
  }
  revalidatePath('/propostas');
  return res.json();
}

export async function updateProposal(id: string, data: any) {
  const companyId = await getSelectedCompanyId();
  if (!companyId) throw new Error('Empresa não selecionada');

  const res = await apiClient(
    `/v1/companies/${companyId}/proposals/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) throw new Error('Erro ao atualizar proposta');
  revalidatePath('/propostas');
  return res.json();
}

export async function updateProposalStatus(id: string, status: string) {
  const companyId = await getSelectedCompanyId();
  if (!companyId) throw new Error('Empresa não selecionada');

  const res = await apiClient(
    `/v1/companies/${companyId}/proposals/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  );

  if (!res.ok) throw new Error('Erro ao alterar status');
  revalidatePath('/propostas');
  return res.json();
}

export async function deleteProposal(id: string) {
  const companyId = await getSelectedCompanyId();
  if (!companyId) throw new Error('Empresa não selecionada');

  const res = await apiClient(
    `/v1/companies/${companyId}/proposals/${id}`,
    { method: 'DELETE' },
  );

  if (!res.ok) throw new Error('Erro ao excluir proposta');
  revalidatePath('/propostas');
}

export async function sendProposalWhatsapp(id: string) {
  const companyId = await getSelectedCompanyId();
  if (!companyId) return { error: 'Empresa não selecionada' };

  try {
    const res = await apiClient(
      `/v1/companies/${companyId}/proposals/${id}/send-whatsapp`,
      { method: 'POST' },
    );

    if (!res.ok) {
      const errText = await res.text();
      let errorMsg = errText;
      try {
        const json = JSON.parse(errText);
        errorMsg = json.message || errText;
      } catch (e) {}
      return { error: `Erro da API: ${errorMsg}` };
    }
    return { success: true, data: await res.json() };
  } catch (err: any) {
    return { error: 'Falha de conexão com a API: ' + err.message };
  }
}

export async function sendProposalFollowUp(id: string) {
  const companyId = await getSelectedCompanyId();
  if (!companyId) return { error: 'Empresa não selecionada' };

  try {
    const res = await apiClient(
      `/v1/companies/${companyId}/proposals/${id}/send-whatsapp-followup`,
      { method: 'POST' },
    );

    if (!res.ok) {
      const errText = await res.text();
      let errorMsg = errText;
      try {
        const json = JSON.parse(errText);
        errorMsg = json.message || errText;
      } catch (e) {}
      return { error: `Erro da API: ${errorMsg}` };
    }
    return { success: true, data: await res.json() };
  } catch (err: any) {
    return { error: 'Falha de conexão com a API: ' + err.message };
  }
}

export async function getCustomers() {
  const companyId = await getSelectedCompanyId();
  if (!companyId) return [];

  const res = await apiClient(`/v1/companies/${companyId}/customers`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getServices() {
  const companyId = await getSelectedCompanyId();
  if (!companyId) return [];

  const res = await apiClient(`/v1/companies/${companyId}/services`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getWhatsappTemplate() {
  const companyId = await getSelectedCompanyId();
  if (!companyId) return null;

  const res = await apiClient(
    `/v1/companies/${companyId}/proposals/whatsapp-template`,
    { cache: 'no-store' },
  );
  if (!res.ok) return null;
  return res.json();
}

export async function saveWhatsappTemplate(template: string, followUpTemplate?: string) {
  const companyId = await getSelectedCompanyId();
  if (!companyId) throw new Error('Empresa não selecionada');

  const res = await apiClient(
    `/v1/companies/${companyId}/proposals/whatsapp-template`,
    {
      method: 'PUT',
      body: JSON.stringify({ template, followUpTemplate }),
    },
  );

  if (!res.ok) throw new Error('Erro ao salvar template');
  revalidatePath('/settings');
  return res.json();
}

export async function getProposalIntegration() {
  const companyId = await getSelectedCompanyId();
  if (!companyId) return { webUrl: '' };

  const res = await apiClient(
    `/v1/companies/${companyId}/proposals/integration`,
    { cache: 'no-store' },
  );
  if (!res.ok) return { webUrl: '' };
  return res.json();
}

export async function saveProposalIntegration(webUrl: string) {
  const companyId = await getSelectedCompanyId();
  if (!companyId) throw new Error('Empresa não selecionada');

  const res = await apiClient(
    `/v1/companies/${companyId}/proposals/integration`,
    {
      method: 'PUT',
      body: JSON.stringify({ webUrl }),
    },
  );

  if (!res.ok) throw new Error('Erro ao salvar configuração');
  revalidatePath('/settings');
  return res.json();
}
