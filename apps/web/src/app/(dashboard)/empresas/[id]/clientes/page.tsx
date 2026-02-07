import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CustomersTable } from './_components/customers-table';

interface ClientesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientesPage({ params }: ClientesPageProps) {
  const { id: companyId } = await params;
  const response = await apiClient(`/v1/companies/${companyId}/customers`);
  const customers = response.ok ? await response.json() : [];

  return (
    <div className="space-y-6">
      {/* Section header with gradient accent */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl blur-xl" />
        <div className="relative flex items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2.5 dark:bg-blue-950">
              <Users className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Clientes</h2>
              <p className="text-sm text-muted-foreground">
                Gerencie os clientes desta empresa
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 shadow-lg">
            <Link href={`/empresas/${companyId}/clientes/novo`}>
              <Plus className="size-4" />
              Novo cliente
            </Link>
          </Button>
        </div>
      </div>

      <CustomersTable companyId={companyId} data={customers} />
    </div>
  );
}
