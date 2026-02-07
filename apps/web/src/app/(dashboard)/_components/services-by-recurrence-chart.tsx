'use client';

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PieChartIcon } from 'lucide-react';

const RECURRENCE_LABELS: Record<string, string> = {
  DAILY: 'Diário',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
};

// Gradient colors matching the design system
const CHART_COLORS = [
  { id: 'violet', start: '#8b5cf6', end: '#6d28d9' },
  { id: 'blue', start: '#3b82f6', end: '#06b6d4' },
  { id: 'emerald', start: '#10b981', end: '#14b8a6' },
  { id: 'orange', start: '#f97316', end: '#ec4899' },
];

interface ServicesByRecurrenceChartProps {
  data: { recurrence: string; count: number }[];
}

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="glass-strong rounded-lg p-3 shadow-lg border border-border/50">
      <p className="text-sm font-medium text-foreground">{payload[0].name}</p>
      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
        {payload[0].value} {payload[0].value === 1 ? 'serviço' : 'serviços'}
      </p>
    </div>
  );
};

// Custom label for the donut
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label for very small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function ServicesByRecurrenceChart({ data }: ServicesByRecurrenceChartProps) {
  const chartData = data.map((d) => ({
    name: RECURRENCE_LABELS[d.recurrence] ?? d.recurrence,
    value: d.count,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm hover-lift">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950">
          <PieChartIcon className="size-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Serviços por recorrência</h2>
          <p className="text-sm text-muted-foreground">Distribuição por tipo</p>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {CHART_COLORS.map((color) => (
                <linearGradient key={color.id} id={`gradient-${color.id}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={color.start} />
                  <stop offset="100%" stopColor={color.end} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              label={renderCustomLabel}
              labelLine={false}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={chartData[index].name}
                  fill={`url(#gradient-${CHART_COLORS[index % CHART_COLORS.length].id})`}
                  strokeWidth={2}
                  className="stroke-background"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value: string, entry: any) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
            {/* Center text showing total */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground"
            >
              <tspan x="50%" dy="-0.5em" className="text-2xl font-bold">
                {total}
              </tspan>
              <tspan x="50%" dy="1.5em" className="text-sm fill-muted-foreground">
                Total
              </tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
