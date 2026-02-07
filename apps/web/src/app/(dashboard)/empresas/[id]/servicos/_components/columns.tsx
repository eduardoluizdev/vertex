'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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

const recurrenceLabels: Record<string, string> = {
  DAILY: 'Diário',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
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
    },
    {
      id: 'customers',
      header: 'Clientes',
      cell: ({ row }) => {
        const customers = row.original.customers;
        if (!customers?.length) return '—';
        return customers.map((c) => c.name).join(', ');
      },
    },
    {
      accessorKey: 'price',
      header: 'Preço',
      cell: ({ row }) => formatCurrency(row.original.price),
    },
    {
      accessorKey: 'recurrence',
      header: 'Recorrência',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {recurrenceLabels[row.original.recurrence] ?? row.original.recurrence}
        </Badge>
      ),
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
