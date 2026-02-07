import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Building2, Users, Briefcase } from 'lucide-react';

export type DashboardTotals = {
  companies: number;
  customers: number;
  services: number;
};

interface StatsCardsProps {
  totals: DashboardTotals;
}

const stats = [
  {
    key: 'companies' as const,
    label: 'Empresas',
    icon: Building2,
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100 dark:bg-violet-950',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    key: 'customers' as const,
    label: 'Clientes',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-600',
    iconBg: 'bg-blue-100 dark:bg-blue-950',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'services' as const,
    label: 'Serviços',
    icon: Briefcase,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
];

export function StatsCards({ totals }: StatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map(({ key, label, icon: Icon, gradient, iconBg, iconColor }) => (
        <Card
          key={key}
          className="group relative overflow-hidden hover-lift border-0 shadow-lg"
        >
          {/* Gradient background overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03] transition-opacity group-hover:opacity-[0.08]`}
          />
          
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <div className={`rounded-lg p-2 ${iconBg} transition-transform group-hover:scale-110`}>
              <Icon className={`size-5 ${iconColor}`} />
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <p className="text-4xl font-bold tracking-tight transition-colors">
              {totals[key].toLocaleString('pt-BR')}
            </p>
            <div className={`mt-2 h-1 w-12 rounded-full bg-gradient-to-r ${gradient} transition-all group-hover:w-20`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
