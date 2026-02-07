import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export type DashboardTotals = {
  companies: number;
  customers: number;
  services: number;
};

interface StatsCardsProps {
  totals: DashboardTotals;
}

export function StatsCards({ totals }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Empresas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totals.companies}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totals.customers}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totals.services}</p>
        </CardContent>
      </Card>
    </div>
  );
}
