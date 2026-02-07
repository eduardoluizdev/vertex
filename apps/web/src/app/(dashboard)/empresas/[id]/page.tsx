import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ServicesByRecurrenceChart } from '../../_components/services-by-recurrence-chart';
import { CompanyStatsCards } from './_components/company-stats-cards';
import { CustomersByMonthChart } from './_components/customers-by-month-chart';
import { LayoutDashboard } from 'lucide-react';

interface CompanyPageProps {
  params: Promise<{ id: string }>;
}

export type CompanyDashboardStats = {
  totals: { customers: number; services: number };
  customersByMonth: { month: string; count: number }[];
  servicesByRecurrence: { recurrence: string; count: number }[];
};

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params;
  const response = await apiClient(`/v1/dashboard/companies/${id}/stats`);

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

      <div className="grid gap-8 lg:grid-cols-2">
        <CustomersByMonthChart data={stats.customersByMonth} />
        <ServicesByRecurrenceChart data={stats.servicesByRecurrence} />
      </div>
    </div>
  );
}
