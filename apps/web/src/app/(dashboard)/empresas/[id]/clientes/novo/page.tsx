import { apiClient } from '@/lib/api';
import { CustomerForm } from '../_components/customer-form';

interface NovoClientePageProps {
  params: Promise<{ id: string }>;
}

export default async function NovoClientePage({ params }: NovoClientePageProps) {
  const { id: companyId } = await params;

  const servicesResponse = await apiClient(`/v1/companies/${companyId}/services`);
  const services = servicesResponse.ok
    ? (await servicesResponse.json()).map((s: { id: string; name: string }) => ({
        id: s.id,
        name: s.name,
      }))
    : [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Novo cliente</h2>
        <p className="text-sm text-muted-foreground">
          Preencha os dados para cadastrar um novo cliente
        </p>
      </div>
      <div className="max-w-2xl">
        <CustomerForm companyId={companyId} services={services} />
      </div>
    </div>
  );
}
