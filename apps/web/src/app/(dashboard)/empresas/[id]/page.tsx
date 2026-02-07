import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ServicesByRecurrenceChart } from '../../_components/services-by-recurrence-chart';
import { CompanyStatsCards } from './_components/company-stats-cards';
import { CustomersByMonthChart } from './_components/customers-by-month-chart';

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
    <div className="space-y-8">
      <CompanyStatsCards totals={stats.totals} />

      <div className="grid gap-8 lg:grid-cols-2">
        <CustomersByMonthChart data={stats.customersByMonth} />
        <ServicesByRecurrenceChart data={stats.servicesByRecurrence} />
      </div>
    </div>
  );
}
