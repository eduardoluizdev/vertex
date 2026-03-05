'use server';

import { apiClient } from '@/lib/api';

export async function getCompanyName(companyId: string): Promise<string> {
  try {
    const response = await apiClient(`/v1/companies/${companyId}`, { cache: 'no-store' });
    if (!response.ok) return '';
    const data = await response.json();
    return data.name ?? '';
  } catch {
    return '';
  }
}

export type WhatsappTemplateCategory = 'LEAD' | 'PROPOSTA_CRIADA' | 'PROPOSTA_ACEITA' | 'CAMPANHA';

export interface WhatsappTemplate {
  id: string;
  name: string;
  content: string;
  category: WhatsappTemplateCategory;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getWhatsappTemplates(
  companyId: string,
  category?: WhatsappTemplateCategory,
): Promise<WhatsappTemplate[]> {
  try {
    const url = category
      ? `/v1/companies/${companyId}/whatsapp-templates?category=${category}`
      : `/v1/companies/${companyId}/whatsapp-templates`;
    const response = await apiClient(url, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export async function createWhatsappTemplate(
  companyId: string,
  data: { name: string; content: string; category: WhatsappTemplateCategory },
): Promise<WhatsappTemplate> {
  const response = await apiClient(`/v1/companies/${companyId}/whatsapp-templates`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
}

export async function updateWhatsappTemplate(
  companyId: string,
  id: string,
  data: Partial<{ name: string; content: string; category: WhatsappTemplateCategory }>,
): Promise<WhatsappTemplate> {
  const response = await apiClient(
    `/v1/companies/${companyId}/whatsapp-templates/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
}

export async function deleteWhatsappTemplate(
  companyId: string,
  id: string,
): Promise<void> {
  const response = await apiClient(
    `/v1/companies/${companyId}/whatsapp-templates/${id}`,
    { method: 'DELETE' },
  );
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
}

export async function generateWhatsappTemplateContent(
  companyId: string,
  data: { name: string; category: WhatsappTemplateCategory; context?: string },
): Promise<{ content: string }> {
  const response = await apiClient(
    `/v1/companies/${companyId}/whatsapp-templates/ai/generate`,
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

export async function sendLeadWhatsapp(
  companyId: string,
  leadId: string,
  templateId: string,
): Promise<void> {
  const response = await apiClient(
    `/v1/companies/${companyId}/lead-lists/leads/${leadId}/send-whatsapp`,
    {
      method: 'POST',
      body: JSON.stringify({ templateId }),
    },
  );
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
}
