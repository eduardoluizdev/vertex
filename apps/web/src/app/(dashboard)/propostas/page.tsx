import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { CompanyContextBreadcrumb } from '@/components/company-context-breadcrumb';
import { getProposals, getCustomers, getProposalIntegration } from './_actions/proposal-actions';
import { ProposalFilters } from './_components/proposal-filters';
import { ProposalRow } from './_components/proposal-row';

interface PropostasPageProps {
  searchParams: Promise<{ customerId?: string; status?: string; followUpDate?: string }>;
}

export default async function PropostasPage({ searchParams }: PropostasPageProps) {
  const filters = await searchParams;
  const [proposals, customers, integration] = await Promise.all([
    getProposals(filters),
    getCustomers(),
    getProposalIntegration(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <CompanyContextBreadcrumb items={[{ label: 'Propostas', icon: FileText }]} />

      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-emerald-500/10 rounded-2xl blur-2xl" />
        <div className="relative glass-strong rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Propostas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas propostas comerciais e acompanhe o status
            </p>
          </div>
          <Button asChild>
            <Link href="/propostas/nova">
              <Plus className="mr-2 h-4 w-4" />
              Nova Proposta
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ProposalFilters customers={customers} currentFilters={filters} />

      {/* List */}
      <div className="rounded-xl border bg-card">
        <div className="p-4">
          {proposals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma proposta encontrada</h3>
              <p className="text-muted-foreground mt-2">
                Crie sua primeira proposta para começar.
              </p>
              <Button asChild className="mt-4">
                <Link href="/propostas/nova">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Proposta
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.map((proposal: any) => (
                <ProposalRow key={proposal.id} proposal={proposal} integrationUrl={integration.webUrl} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
