import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface CompanyStatsCardsProps {
  totals: { customers: number; services: number };
}

export function CompanyStatsCards({ totals }: CompanyStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
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
