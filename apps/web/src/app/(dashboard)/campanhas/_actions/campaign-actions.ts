'use server';

import { revalidatePath } from 'next/cache';
import { getSelectedCompanyId } from '@/lib/cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function createCampaign(data: any) {
  const companyId = await getSelectedCompanyId();
  if (!companyId) throw new Error('Empresa não selecionada');

  const res = await fetch(`${API_URL}/companies/${companyId}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) throw new Error('Failed to create campaign');
  revalidatePath('/campanhas');
  return res.json();
}

export async function updateCampaign(id: string, data: any) {
  const companyId = await getSelectedCompanyId();
  if (!companyId) throw new Error('Empresa não selecionada');

  const res = await fetch(`${API_URL}/companies/${companyId}/campaigns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update campaign');
  revalidatePath('/campanhas');
  return res.json();
}

export async function sendCampaign(id: string) {
  const companyId = await getSelectedCompanyId();
  if (!companyId) throw new Error('Empresa não selecionada');

  const res = await fetch(`${API_URL}/companies/${companyId}/campaigns/${id}/send`, {
    method: 'POST',
  });

  if (!res.ok) throw new Error('Failed to send campaign');
  revalidatePath('/campanhas');
  return res.json();
}

export async function getCampaigns() {
    const companyId = await getSelectedCompanyId();
    if (!companyId) return [];

    const res = await fetch(`${API_URL}/companies/${companyId}/campaigns`, {
        cache: 'no-store'
    });
    if (!res.ok) return [];
    return res.json();
}

export async function getCampaign(id: string) {
    const companyId = await getSelectedCompanyId();
    if (!companyId) return null;

    const res = await fetch(`${API_URL}/companies/${companyId}/campaigns/${id}`, {
        cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
}
