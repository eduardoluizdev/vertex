import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CompanyTabs } from './_components/company-tabs';
import { SyncCompanyCookie } from './_components/sync-company-cookie';

interface CompanyLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function CompanyLayout({
  children,
  params,
}: CompanyLayoutProps) {
  const { id } = await params;
  const response = await apiClient(`/v1/companies/${id}`);

  if (!response.ok) {
    notFound();
  }

  const company = await response.json();

  return (
    <div className="p-6">
      <SyncCompanyCookie companyId={id} />
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/empresas">
              <ArrowLeft className="size-4" />
              Voltar
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-sm text-muted-foreground">{company.email}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/empresas/${id}/editar`}>
              <Pencil className="size-4" />
              Editar empresa
            </Link>
          </Button>
        </div>
      </div>
      <CompanyTabs companyId={id} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
