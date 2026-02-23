import { WizardForm } from './wizard-form';

export default function NovaEmpresaPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Primeiro Acesso / Nova Empresa</h1>
        <p className="text-sm text-muted-foreground">
          Siga as etapas abaixo para configurar sua empresa e integrações.
        </p>
      </div>
      <div className="max-w-3xl">
        <WizardForm />
      </div>
    </div>
  );
}
