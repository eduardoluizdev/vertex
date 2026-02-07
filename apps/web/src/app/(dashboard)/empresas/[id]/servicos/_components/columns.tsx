'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  recurrence: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  customers: {
    id: string;
    name: string;
  }[];
};

const recurrenceConfig = {
  DAILY: {
    label: 'Diário',
    className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
  },
  WEEKLY: {
    label: 'Semanal',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  },
  MONTHLY: {
    label: 'Mensal',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
  YEARLY: {
    label: 'Anual',
    className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function getColumns(
  companyId: string,
  onDelete: (service: Service) => void,
): ColumnDef<Service>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.name}</p>
          {row.original.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'customers',
      header: 'Clientes',
      cell: ({ row }) => {
        const customers = row.original.customers;
        if (!customers?.length) {
          return <span className="text-muted-foreground">—</span>;
        }
        if (customers.length === 1) {
          return <span className="text-muted-foreground">{customers[0].name}</span>;
        }
        return (
          <Badge variant="outline" className="gap-1.5 font-medium">
            <Users className="size-3" />
            {customers.length} clientes
          </Badge>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Preço',
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">
          {formatCurrency(row.original.price)}
        </span>
      ),
    },
    {
      accessorKey: 'recurrence',
      header: 'Recorrência',
      cell: ({ row }) => {
        const config = recurrenceConfig[row.original.recurrence];
        return (
          <Badge variant="outline" className={`gap-1.5 font-medium ${config.className}`}>
            <Calendar className="size-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const service = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/empresas/${companyId}/servicos/${service.id}/editar`}>
                  <Pencil className="size-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(service)}
              >
                <Trash2 className="size-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
