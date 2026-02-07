import { apiClient } from '@/lib/api';
import { StatsCards } from './_components/stats-cards';
import { CompaniesByMonthChart } from './_components/companies-by-month-chart';
import { ServicesByRecurrenceChart } from './_components/services-by-recurrence-chart';
import { TopCompaniesChart } from './_components/top-companies-chart';
import { Breadcrumb } from '@/components/breadcrumb';
import { LayoutDashboard } from 'lucide-react';

export type DashboardStats = {
  totals: { companies: number; customers: number; services: number };
  companiesByMonth: { month: string; count: number }[];
  servicesByRecurrence: { recurrence: string; count: number }[];
  topCompaniesByCustomers: {
    id: string;
    name: string;
    customersCount: number;
  }[];
};

export default async function Home() {
  const response = await apiClient('/v1/dashboard/stats');

  if (!response.ok) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Visão geral</h1>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar as estatísticas. Tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }

  const stats: DashboardStats = await response.json();

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{ label: 'Dashboard', icon: LayoutDashboard }]}
      />

      {/* Header with gradient accent */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-emerald-500/10 rounded-2xl blur-2xl" />
        <div className="relative glass-strong rounded-2xl p-6">
          <h1 className="text-3xl font-bold tracking-tight">Visão geral</h1>
          <p className="text-muted-foreground mt-1">
            Resumo das empresas, clientes e serviços
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <StatsCards totals={stats.totals} />

        <div className="grid gap-8 lg:grid-cols-2">
          <CompaniesByMonthChart data={stats.companiesByMonth} />
          <ServicesByRecurrenceChart data={stats.servicesByRecurrence} />
        </div>

        <TopCompaniesChart data={stats.topCompaniesByCustomers} />
      </div>
    </div>
  );
}
