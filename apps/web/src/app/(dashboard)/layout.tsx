import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AppSidebar } from '@/components/app-sidebar';
import { apiClient } from '@/lib/api';
import { getSelectedCompanyId, SELECTED_COMPANY_COOKIE } from '@/lib/cookies';
import { Topbar } from '@/components/topbar';

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
  
  // Header-based check to prevent infinite loop on /empresas/nova
  const headersList = await import('next/headers').then(m => m.headers());
  const currentPath = headersList.get('x-invoke-path') || headersList.get('referer') || '';
  
  if (companies.length === 0 && !currentPath.includes('/empresas/nova')) {
    redirect('/empresas/nova');
  }

  const validIds = new Set(companies.map((c: { id: string }) => c.id));
  const resolvedSelectedId =
    selectedCompanyId && validIds.has(selectedCompanyId) ? selectedCompanyId : null;

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        companies={companies}
        selectedCompanyId={resolvedSelectedId}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar selectedCompanyId={resolvedSelectedId} />
        <main className="flex-1 overflow-y-auto bg-muted/10">
            {children}
        </main>
      </div>
    </div>
  );
}
