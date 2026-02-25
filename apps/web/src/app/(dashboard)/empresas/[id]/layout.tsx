import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SyncCompanyCookie } from './_components/sync-company-cookie';
import { CompanyBreadcrumb } from './_components/company-breadcrumb';

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
    <div className="p-6 space-y-6">
      <SyncCompanyCookie companyId={id} />
      
      {/* Breadcrumb */}
      <CompanyBreadcrumb companyId={id} companyName={company.name} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight truncate">
            {company.name}
          </h1>
          <p className="text-muted-foreground mt-1 truncate">
            {company.email}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/empresas">
              <ArrowLeft className="size-4" />
              Voltar
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/empresas/${id}/editar`}>
              <Pencil className="size-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">{children}</div>
    </div>
  );
}
