import Link from 'next/link';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CompaniesTable } from './_components/companies-table';

export default async function EmpresasPage() {
  const response = await apiClient('/v1/companies');
  const companies = response.ok ? await response.json() : [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
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
