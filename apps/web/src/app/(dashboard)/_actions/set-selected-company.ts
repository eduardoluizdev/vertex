'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api';
import { SELECTED_COMPANY_COOKIE } from '@/lib/cookies';

/**
 * Define a empresa selecionada: valida acesso, seta o cookie e redireciona para a área da empresa.
 * Se companyId for null, apenas limpa o cookie e redireciona para /empresas.
 */
export async function setSelectedCompany(companyId: string | null) {
  if (!companyId) {
    const cookieStore = await cookies();
    cookieStore.delete(SELECTED_COMPANY_COOKIE);
    redirect('/empresas');
  }

  const response = await apiClient('/v1/companies');
  if (!response.ok) {
    redirect('/empresas');
  }

  const companies = await response.json();
  const hasAccess = Array.isArray(companies) && companies.some((c: { id: string }) => c.id === companyId);
  if (!hasAccess) {
    const cookieStore = await cookies();
    cookieStore.delete(SELECTED_COMPANY_COOKIE);
    redirect('/empresas');
  }

  const cookieStore = await cookies();
  cookieStore.set(SELECTED_COMPANY_COOKIE, companyId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 ano
  });

  redirect(`/empresas/${companyId}`);
}

/**
 * Sincroniza o cookie da empresa selecionada com a URL (sem redirect).
 * Usado quando o usuário navega para /empresas/[id]/... para a sidebar refletir a empresa atual.
 * Só pode ser chamado de Server Action ou Route Handler (cookies).
 */
export async function syncSelectedCompanyCookie(companyId: string) {
  const response = await apiClient('/v1/companies');
  if (!response.ok) return;

  const companies = await response.json();
  const hasAccess = Array.isArray(companies) && companies.some((c: { id: string }) => c.id === companyId);
  if (!hasAccess) return;

  const cookieStore = await cookies();
  cookieStore.set(SELECTED_COMPANY_COOKIE, companyId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}
