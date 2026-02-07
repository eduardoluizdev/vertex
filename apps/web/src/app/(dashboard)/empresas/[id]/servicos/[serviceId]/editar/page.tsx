import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/masks';
import { ServiceForm } from '../../_components/service-form';

interface EditarServicoPageProps {
  params: Promise<{ id: string; serviceId: string }>;
}

export default async function EditarServicoPage({ params }: EditarServicoPageProps) {
  const { id: companyId, serviceId } = await params;

  const [serviceResponse, customersResponse] = await Promise.all([
    apiClient(`/v1/companies/${companyId}/services/${serviceId}`),
    apiClient(`/v1/companies/${companyId}/customers`),
  ]);

  if (!serviceResponse.ok) {
    notFound();
  }

  const service = await serviceResponse.json();
  const customers = customersResponse.ok
    ? (await customersResponse.json()).map((c: { id: string; name: string }) => ({
        id: c.id,
        name: c.name,
      }))
    : [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Editar serviço</h2>
        <p className="text-sm text-muted-foreground">
          Atualize os dados do serviço
        </p>
      </div>
      <div className="max-w-2xl">
        <ServiceForm
          companyId={companyId}
          customers={customers}
          serviceId={serviceId}
          defaultValues={{
            name: service.name,
            description: service.description ?? '',
            price: formatCurrency(service.price),
            recurrence: service.recurrence,
            customerIds: service.customers?.map((c: { id: string }) => c.id) ?? [],
          }}
        />
      </div>
    </div>
  );
}
