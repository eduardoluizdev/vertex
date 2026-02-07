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
import { maskPhone } from '@/lib/masks';

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;
  personType: 'INDIVIDUAL' | 'COMPANY';
  _count: {
    services: number;
  };
};

const personTypeLabels: Record<string, string> = {
  INDIVIDUAL: 'Pessoa Física',
  COMPANY: 'Pessoa Jurídica',
};

export function getColumns(
  companyId: string,
  onDelete: (customer: Customer) => void,
): ColumnDef<Customer>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (<Link href={`/empresas/${companyId}/clientes/${row.original.id}/editar`}>{row.original.name}</Link>),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
      cell: ({ row }) => maskPhone(row.original.phone ?? '') || '—',
    },
    {
      accessorKey: 'personType',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {personTypeLabels[row.original.personType] ?? row.original.personType}
        </Badge>
      ),
    },
    {
      id: 'services',
      header: 'Serviços',
      cell: ({ row }) => row.original._count.services,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/empresas/${companyId}/clientes/${customer.id}/editar`}>
                  <Pencil className="size-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(customer)}
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
