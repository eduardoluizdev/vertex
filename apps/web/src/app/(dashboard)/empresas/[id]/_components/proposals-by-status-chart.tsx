'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FileText } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  APPROVED: 'Aprovado',
  REJECTED: 'Reprovado',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'hsl(var(--muted-foreground))',
  SENT: 'hsl(var(--primary))',
  APPROVED: 'hsl(var(--chart-2, 160 60% 45%))', 
  REJECTED: 'hsl(var(--destructive))',
};

interface ProposalsByStatusChartProps {
  data?: { status: string; count: number }[];
}

export function ProposalsByStatusChart({ data = [] }: ProposalsByStatusChartProps) {
  // Parse data for the pie chart
  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    value: d.count,
    fill: STATUS_COLORS[d.status] || 'hsl(var(--muted))',
  }));

  const totalProposals = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Propostas por Status</CardTitle>
        </div>
        <CardDescription>Distribuição de suas propostas cadastradas</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4 min-h-[300px]">
        {totalProposals > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                strokeWidth={2}
                stroke="hsl(var(--background))"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center pt-8">
            <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma proposta cadastrada.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
