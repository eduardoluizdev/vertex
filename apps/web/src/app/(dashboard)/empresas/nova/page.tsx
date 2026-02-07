import { CompanyForm } from '../_components/company-form';

export default function NovaEmpresaPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nova empresa</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados para cadastrar uma nova empresa
        </p>
      </div>
      <div className="max-w-2xl">
        <CompanyForm />
      </div>
    </div>
  );
}
