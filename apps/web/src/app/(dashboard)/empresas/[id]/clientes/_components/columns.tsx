'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2, User, Building2, Briefcase } from 'lucide-react';
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

const personTypeConfig = {
  INDIVIDUAL: {
    label: 'Pessoa Física',
    icon: User,
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  },
  COMPANY: {
    label: 'Pessoa Jurídica',
    icon: Building2,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
};

export function getColumns(
  companyId: string,
  onDelete: (customer: Customer) => void,
): ColumnDef<Customer>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <Link 
          href={`/empresas/${companyId}/clientes/${row.original.id}/editar`}
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
      accessorKey: 'personType',
      header: 'Tipo',
      cell: ({ row }) => {
        const config = personTypeConfig[row.original.personType];
        const Icon = config.icon;
        return (
          <Badge variant="outline" className={`gap-1.5 font-medium ${config.className}`}>
            <Icon className="size-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: 'services',
      header: 'Serviços',
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1.5 font-medium">
          <Briefcase className="size-3" />
          {row.original._count.services}
        </Badge>
      ),
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
