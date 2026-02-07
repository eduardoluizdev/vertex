import Link from 'next/link';
import { Plus, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CompaniesTable } from './_components/companies-table';
import { Breadcrumb } from '@/components/breadcrumb';

export default async function EmpresasPage() {
  const response = await apiClient('/v1/companies');
  const companies = response.ok ? await response.json() : [];

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Empresas', icon: Building2 }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Empresas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as empresas cadastradas
          </p>
        </div>
        <Button asChild>
          <Link href="/empresas/nova">
            <Plus className="size-4" />
            Nova empresa
          </Link>
        </Button>
      </div>
      <CompaniesTable data={companies} />
    </div>
  );
}
