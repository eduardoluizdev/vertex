import Link from 'next/link';
import { Plus, Briefcase } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Section header with gradient accent */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl blur-xl" />
        <div className="relative flex items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2.5 dark:bg-emerald-950">
              <Briefcase className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Serviços</h2>
              <p className="text-sm text-muted-foreground">
                Gerencie os serviços desta empresa
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 shadow-lg">
            <Link href={`/empresas/${companyId}/servicos/novo`}>
              <Plus className="size-4" />
              Novo serviço
            </Link>
          </Button>
        </div>
      </div>

      <ServicesTable companyId={companyId} data={services} />
    </div>
  );
}
