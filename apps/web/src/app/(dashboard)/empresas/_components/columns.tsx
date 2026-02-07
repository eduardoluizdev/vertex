'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { maskCNPJ, maskPhone } from '@/lib/masks';

export type Company = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cnpj: string | null;
  _count: {
    customers: number;
    services: number;
  };
};

export function getColumns(
  onDelete: (company: Company) => void,
): ColumnDef<Company>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (<Link href={`/empresas/${row.original.id}`}>{row.original.name}</Link>),
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
      accessorKey: 'cnpj',
      header: 'CNPJ',
      cell: ({ row }) => maskCNPJ(row.original.cnpj ?? '') || '—',
    },
    {
      id: 'customers',
      header: 'Clientes',
      cell: ({ row }) => row.original._count.customers,
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
        const company = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/empresas/${company.id}`}>
                  <Pencil className="size-4" />
                  Ver detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/empresas/${company.id}/editar`}>
                  <Pencil className="size-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(company)}
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
