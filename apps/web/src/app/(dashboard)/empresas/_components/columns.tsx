'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2, Users, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      cell: ({ row }) => (
        <Link 
          href={`/empresas/${row.original.id}`}
          className="font-semibold text-primary hover:underline transition-smooth"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {maskPhone(row.original.phone ?? '') || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'cnpj',
      header: 'CNPJ',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-sm">
          {maskCNPJ(row.original.cnpj ?? '') || '—'}
        </span>
      ),
    },
    {
      id: 'customers',
      header: 'Clientes',
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1.5 font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
          <Users className="size-3" />
          {row.original._count.customers}
        </Badge>
      ),
    },
    {
      id: 'services',
      header: 'Serviços',
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1.5 font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
          <Briefcase className="size-3" />
          {row.original._count.services}
        </Badge>
      ),
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
