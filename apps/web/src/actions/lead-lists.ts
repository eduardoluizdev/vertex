'use server';

import { apiClient } from '@/lib/api';

export interface LeadList {
  id: string;
  name: string;
  nicho: string;
  cidade: string;
  estado: string;
  pais: string;
  quantidade: number;
  status: 'PROCESSANDO' | 'CONCLUIDO' | 'FALHA';
  companyId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { leads: number };
}

export interface Lead {
  id: string;
  leadListId: string;
  stage: LeadKanbanStage;
  name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  rating: number | null;
  reviewCount: number | null;
  category: string | null;
  rawData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type LeadKanbanStage =
  | 'NOVO'
  | 'CONTATO_INICIAL'
  | 'INTERESSADO'
  | 'PROPOSTA_ENVIADA'
  | 'EM_NEGOCIACAO'
  | 'CLIENTE'
  | 'PERDIDO';

export interface LeadListWithLeads extends LeadList {
  leads: Lead[];
}

export async function getLeadLists(companyId: string): Promise<LeadList[]> {
  try {
    const response = await apiClient(`/v1/companies/${companyId}/lead-lists`, {
      cache: 'no-store',
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export async function createLeadList(
  companyId: string,
  data: {
    name: string;
    nicho: string;
    cidade: string;
    estado: string;
    pais: string;
    quantidade: number;
  },
): Promise<LeadList | null> {
  const response = await apiClient(`/v1/companies/${companyId}/lead-lists`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
}

export async function getLeadList(
  companyId: string,
  listId: string,
): Promise<LeadListWithLeads | null> {
  try {
    const response = await apiClient(
      `/v1/companies/${companyId}/lead-lists/${listId}`,
      { cache: 'no-store' },
    );
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function updateLeadStage(
  companyId: string,
  leadId: string,
  stage: LeadKanbanStage,
): Promise<void> {
  await apiClient(
    `/v1/companies/${companyId}/lead-lists/leads/${leadId}/stage`,
    {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    },
  );
}

export async function addLead(
  companyId: string,
  listId: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    category?: string;
  },
): Promise<Lead> {
  const response = await apiClient(
    `/v1/companies/${companyId}/lead-lists/${listId}/leads`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
}

export async function deleteLeadList(
  companyId: string,
  listId: string,
): Promise<void> {
  await apiClient(`/v1/companies/${companyId}/lead-lists/${listId}`, {
    method: 'DELETE',
  });
}

export async function deleteLead(
  companyId: string,
  leadId: string,
): Promise<void> {
  const response = await apiClient(
    `/v1/companies/${companyId}/lead-lists/leads/${leadId}`,
    { method: 'DELETE' },
  );
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
}
