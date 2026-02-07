import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AppSidebar } from '@/components/app-sidebar';
import { apiClient } from '@/lib/api';
import { getSelectedCompanyId, SELECTED_COMPANY_COOKIE } from '@/lib/cookies';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const [companiesResponse, selectedCompanyId] = await Promise.all([
    apiClient('/v1/companies'),
    getSelectedCompanyId(),
  ]);

  const companies = companiesResponse.ok ? await companiesResponse.json() : [];
  const validIds = new Set(companies.map((c: { id: string }) => c.id));
  const resolvedSelectedId =
    selectedCompanyId && validIds.has(selectedCompanyId) ? selectedCompanyId : null;

  if (selectedCompanyId && !resolvedSelectedId) {
    const cookieStore = await cookies();
    cookieStore.delete(SELECTED_COMPANY_COOKIE);
  }

  return (
    <div className="flex h-screen">
      <AppSidebar
        companies={companies}
        selectedCompanyId={resolvedSelectedId}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
