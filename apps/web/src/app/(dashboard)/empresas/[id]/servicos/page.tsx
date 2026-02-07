import Link from 'next/link';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ServicesTable } from './_components/services-table';

interface ServicosPageProps {
  params: Promise<{ id: string }>;
}

export default async function ServicosPage({ params }: ServicosPageProps) {
  const { id: companyId } = await params;
  const response = await apiClient(`/v1/companies/${companyId}/services`);
  const services = response.ok ? await response.json() : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Serviços</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os serviços desta empresa
          </p>
        </div>
        <Button asChild>
          <Link href={`/empresas/${companyId}/servicos/novo`}>
            <Plus className="size-4" />
            Novo serviço
          </Link>
        </Button>
      </div>
      <ServicesTable companyId={companyId} data={services} />
    </div>
  );
}
