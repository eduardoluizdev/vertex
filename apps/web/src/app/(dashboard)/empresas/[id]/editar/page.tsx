import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { CompanyForm } from '../../_components/company-form';

interface EditarEmpresaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarEmpresaPage({ params }: EditarEmpresaPageProps) {
  const { id } = await params;
  const response = await apiClient(`/v1/companies/${id}`);

  if (!response.ok) {
    notFound();
  }

  const company = await response.json();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar empresa</h1>
        <p className="text-sm text-muted-foreground">
          Atualize os dados da empresa
        </p>
      </div>
      <div className="max-w-2xl">
        <CompanyForm
          companyId={id}
          defaultValues={{
            name: company.name,
            email: company.email,
            phone: company.phone ?? '',
            address: company.address ?? '',
            logo: company.logo ?? '',
            cnpj: company.cnpj ?? '',
          }}
        />
      </div>
    </div>
  );
}
