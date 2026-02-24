import { notFound } from 'next/navigation';
import { FileText } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { ProposalForm } from '../_components/proposal-form';
import { getProposal, getCustomers, getServices } from '../_actions/proposal-actions';

interface EditPropostaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropostaPage({ params }: EditPropostaPageProps) {
  const { id } = await params;
  const [proposal, customers, services] = await Promise.all([
    getProposal(id),
    getCustomers(),
    getServices(),
  ]);

  if (!proposal) notFound();

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Propostas', href: '/propostas', icon: FileText },
          { label: `Proposta #${String(proposal.number).padStart(4, '0')}` },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Editar Proposta #{String(proposal.number).padStart(4, '0')}
        </h1>
        <p className="text-muted-foreground mt-1">{proposal.title}</p>
      </div>

      <ProposalForm proposal={proposal} customers={customers} services={services} />
    </div>
  );
}
