import Link from 'next/link';
import { Plus } from 'lucide-react';
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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os clientes desta empresa
          </p>
        </div>
        <Button asChild>
          <Link href={`/empresas/${companyId}/clientes/novo`}>
            <Plus className="size-4" />
            Novo cliente
          </Link>
        </Button>
      </div>
      <CustomersTable companyId={companyId} data={customers} />
    </div>
  );
}
