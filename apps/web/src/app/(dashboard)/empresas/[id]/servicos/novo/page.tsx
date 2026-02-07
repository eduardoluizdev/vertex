import { apiClient } from '@/lib/api';
import { ServiceForm } from '../_components/service-form';

interface NovoServicoPageProps {
  params: Promise<{ id: string }>;
}

export default async function NovoServicoPage({ params }: NovoServicoPageProps) {
  const { id: companyId } = await params;

  const response = await apiClient(`/v1/companies/${companyId}/customers`);
  const customers = response.ok
    ? (await response.json()).map((c: { id: string; name: string }) => ({
        id: c.id,
        name: c.name,
      }))
    : [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Novo serviço</h2>
        <p className="text-sm text-muted-foreground">
          Preencha os dados para cadastrar um novo serviço
        </p>
      </div>
      <div className="max-w-2xl">
        <ServiceForm companyId={companyId} customers={customers} />
      </div>
    </div>
  );
}
