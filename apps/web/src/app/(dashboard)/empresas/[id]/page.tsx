import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ServicesByRecurrenceChart } from '../../_components/services-by-recurrence-chart';
import { CompanyStatsCards } from './_components/company-stats-cards';
import { CustomersByMonthChart } from './_components/customers-by-month-chart';
import { ProposalsByStatusChart } from './_components/proposals-by-status-chart';
import { FollowUpButton } from './_components/follow-up-button';
import { LayoutDashboard, CalendarClock } from 'lucide-react';
import { getFollowUpToday } from '@/app/(dashboard)/propostas/_actions/proposal-actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface CompanyPageProps {
  params: Promise<{ id: string }>;
}

export type CompanyDashboardStats = {
  totals: { customers: number; services: number };
  customersByMonth: { month: string; count: number }[];
  servicesByRecurrence: { recurrence: string; count: number }[];
  proposalsByStatus?: { status: string; count: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  APPROVED: 'Aprovado',
  REJECTED: 'Reprovado',
};

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params;
  const [response, followUpProposals] = await Promise.all([
    apiClient(`/v1/dashboard/companies/${id}/stats`),
    getFollowUpToday(),
  ]);

  if (!response.ok) {
    notFound();
  }

  const stats: CompanyDashboardStats = await response.json();

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-950">
          <LayoutDashboard className="size-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Visão geral da empresa</p>
        </div>
      </div>

      <CompanyStatsCards totals={stats.totals} />

      {/* Follow-up do dia */}
      {followUpProposals.length > 0 && (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b bg-amber-50/50 dark:bg-amber-950/20">
            <CalendarClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-amber-700 dark:text-amber-400">
              Follow-Up de Hoje ({followUpProposals.length})
            </h3>
          </div>
          <div className="divide-y">
            {followUpProposals.map((proposal: any) => {
              return (
                <div
                  key={proposal.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        #{String(proposal.number).padStart(4, '0')}
                      </span>
                      <span className="font-medium">{proposal.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {STATUS_LABELS[proposal.status] ?? proposal.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{proposal.customer?.name}</p>
                    <p className="text-sm font-semibold">
                      R$ {Number(proposal.totalValue).toFixed(2).replace('.', ',')}
                    </p>
                  </div>

                  <FollowUpButton proposalId={proposal.id} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <CustomersByMonthChart data={stats.customersByMonth} />
        <ServicesByRecurrenceChart data={stats.servicesByRecurrence} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProposalsByStatusChart data={stats.proposalsByStatus} />
      </div>
    </div>
  );
}

