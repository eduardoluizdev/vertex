'use client';

import Link from 'next/link';
import { Building2, ChevronDown, Plus, List } from 'lucide-react';
import { setSelectedCompany } from '@/app/(dashboard)/_actions/set-selected-company';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type CompanyOption = { id: string; name: string };

interface CompanySelectorProps {
  companies: CompanyOption[];
  selectedCompanyId: string | null;
  collapsed?: boolean;
}

export function CompanySelector({
  companies,
  selectedCompanyId,
  collapsed = false,
}: CompanySelectorProps) {
  const selectedCompany = selectedCompanyId
    ? companies.find((c) => c.id === selectedCompanyId)
    : null;
  const label = selectedCompany?.name ?? 'Selecione uma empresa';

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
          <DropdownMenuTrigger
            className={cn(
              'flex w-full items-center rounded-lg py-2 text-sm text-sidebar-foreground/90 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              collapsed ? 'justify-center px-0' : 'gap-2 px-3',
            )}
          >
            <Building2 className="size-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="truncate text-left font-medium">{label}</span>
                <ChevronDown className="ml-auto size-4 shrink-0 opacity-70" />
              </>
            )}
          </DropdownMenuTrigger>
        </TooltipTrigger>
          {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
        </Tooltip>
        <DropdownMenuContent
        side={collapsed ? 'right' : 'bottom'}
        align={collapsed ? 'end' : 'start'}
        className="w-56"
      >
        {companies.length === 0 ? (
          <DropdownMenuItem asChild>
            <Link href="/empresas/nova">
              <Plus className="size-4" />
              Nova empresa
            </Link>
          </DropdownMenuItem>
        ) : (
          <>
            {companies.map((company) => (
              <DropdownMenuItem
                key={company.id}
                onClick={() => setSelectedCompany(company.id)}
              >
                <Building2 className="size-4" />
                {company.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/empresas">
                <List className="size-4" />
                Ver todas as empresas
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/empresas/nova">
                <Plus className="size-4" />
                Nova empresa
              </Link>
            </DropdownMenuItem>
          </>
        )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
