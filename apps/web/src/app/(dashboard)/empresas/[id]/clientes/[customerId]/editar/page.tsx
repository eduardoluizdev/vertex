import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { CustomerForm } from '../../_components/customer-form';

interface EditarClientePageProps {
  params: Promise<{ id: string; customerId: string }>;
}

export default async function EditarClientePage({ params }: EditarClientePageProps) {
  const { id: companyId, customerId } = await params;

  const [customerResponse, servicesResponse] = await Promise.all([
    apiClient(`/v1/companies/${companyId}/customers/${customerId}`),
    apiClient(`/v1/companies/${companyId}/services`),
  ]);

  if (!customerResponse.ok) {
    notFound();
  }

  const customer = await customerResponse.json();
  const services = servicesResponse.ok
    ? (await servicesResponse.json()).map((s: { id: string; name: string; recurrence: string }) => ({
        id: s.id,
        name: s.name,
        recurrence: s.recurrence,
      }))
    : [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Editar cliente</h2>
        <p className="text-sm text-muted-foreground">
          Atualize os dados do cliente
        </p>
      </div>
      <div className="max-w-2xl">
        <CustomerForm
          companyId={companyId}
          customerId={customerId}
          services={services}
          defaultValues={{
            name: customer.name,
            email: customer.email,
            phone: customer.phone ?? '',
            website: customer.website ?? '',
            document: customer.document ?? '',
            personType: customer.personType,
            zip: customer.zip ?? '',
            street: customer.street ?? '',
            neighborhood: customer.neighborhood ?? '',
            number: customer.number ?? '',
            complement: customer.complement ?? '',
            city: customer.city ?? '',
            state: customer.state ?? '',
            subscriptions: customer.services?.map((sub: any) => ({
               serviceId: sub.service.id,
               recurrenceDay: sub.recurrenceDay,
               recurrenceMonth: sub.recurrenceMonth,
            })) ?? [],
          }}
        />
      </div>
    </div>
  );
}
