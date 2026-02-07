'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Trophy } from 'lucide-react';

interface TopCompaniesChartProps {
  data: { id: string; name: string; customersCount: number }[];
}

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="glass-strong rounded-lg p-3 shadow-lg border border-border/50">
      <p className="text-sm font-medium text-foreground">{payload[0].payload.name}</p>
      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
        {payload[0].value} {payload[0].value === 1 ? 'cliente' : 'clientes'}
      </p>
    </div>
  );
};

export function TopCompaniesChart({ data }: TopCompaniesChartProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm hover-lift">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950">
          <Trophy className="size-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Top empresas</h2>
          <p className="text-sm text-muted-foreground">Ranking por clientes</p>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
          >
            <defs>
              <linearGradient id="colorTopCompanies" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              allowDecimals={false}
              className="text-muted-foreground"
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.1 }} />
            <Bar
              dataKey="customersCount"
              fill="url(#colorTopCompanies)"
              radius={[0, 8, 8, 0]}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
