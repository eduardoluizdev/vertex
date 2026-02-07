import { cookies } from 'next/headers';

const SELECTED_COMPANY_COOKIE = 'vertex_selected_company_id';

/**
 * Lê o ID da empresa selecionada do cookie (server-side).
 * Retorna null se não existir ou estiver vazio.
 */
export async function getSelectedCompanyId(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SELECTED_COMPANY_COOKIE)?.value?.trim();
  return value || null;
}

export { SELECTED_COMPANY_COOKIE };
