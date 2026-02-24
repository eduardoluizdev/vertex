import { FileText } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { ProposalForm } from '../_components/proposal-form';
import { getCustomers, getServices } from '../_actions/proposal-actions';

export default async function NovaPropostaPage() {
  const [customers, services] = await Promise.all([
    getCustomers(),
    getServices(),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Propostas', href: '/propostas', icon: FileText },
          { label: 'Nova Proposta' },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nova Proposta</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os dados e adicione os itens da proposta.
        </p>
      </div>

      <ProposalForm customers={customers} services={services} />
    </div>
  );
}
