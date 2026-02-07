'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Home, Building2, LogOut, PanelLeft, Users, Briefcase, LayoutDashboard } from 'lucide-react';
import { CompanySelector, type CompanyOption } from '@/components/company-selector';
import { VertexLogo } from '@/components/vertex-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface AppSidebarProps {
  companies: CompanyOption[];
  selectedCompanyId: string | null;
}

export function AppSidebar({ companies, selectedCompanyId }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();

  const userName = session?.user?.name ?? '';
  const userImage = session?.user?.image ?? undefined;

  return (
    <aside
      className={`flex h-screen flex-col border-r bg-sidebar py-4 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-72'
      }`}
    >
      <div className={`flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between px-4'}`}>
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCollapsed(false)}
                  className="flex size-10 items-center justify-center"
                >
                  <VertexLogo className="size-7 text-sidebar-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expandir</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            <Link href="/" className="flex items-center gap-2">
              <VertexLogo className="size-7 shrink-0 text-sidebar-foreground" />
              <span className="text-base font-semibold text-sidebar-foreground">
                Vertex
              </span>
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              className="flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <PanelLeft className="size-4" />
            </button>
          </>
        )}
      </div>

      <div className="mt-4 px-3">
        <CompanySelector
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          collapsed={collapsed}
        />
      </div>

      <TooltipProvider>
        <nav className={`mt-4 flex flex-1 flex-col gap-1 px-3`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                className={`flex items-center rounded-lg py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                  collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                }`}
              >
                <Home className="size-5 shrink-0" />
                {!collapsed && <span>Home</span>}
              </Link>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Home</TooltipContent>}
          </Tooltip>
          {selectedCompanyId && (
            <>
            <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/empresas/${selectedCompanyId}`}
                    className={`flex items-center rounded-lg py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                      collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    }`}
                  >
                    <LayoutDashboard className="size-5 shrink-0" />
                    {!collapsed && <span>Dashboard</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Dashboard</TooltipContent>}
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/empresas/${selectedCompanyId}/clientes`}
                    className={`flex items-center rounded-lg py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                      collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    }`}
                  >
                    <Users className="size-5 shrink-0" />
                    {!collapsed && <span>Clientes</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Clientes</TooltipContent>}
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/empresas/${selectedCompanyId}/servicos`}
                    className={`flex items-center rounded-lg py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                      collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    }`}
                  >
                    <Briefcase className="size-5 shrink-0" />
                    {!collapsed && <span>Serviços</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Serviços</TooltipContent>}
              </Tooltip>
            </>
          )}

        </nav>
      </TooltipProvider>

      <div className="mt-auto px-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`flex w-full items-center rounded-lg py-2 outline-none transition-colors hover:bg-sidebar-accent ${
              collapsed ? 'justify-center px-0' : 'gap-3 px-3'
            }`}
          >
            <Avatar size="sm">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback>{getInitials(userName || 'U')}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <span className="truncate text-sm font-medium">{userName}</span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={collapsed ? 'right' : 'top'}
            align={collapsed ? 'end' : 'start'}
            className="w-52"
          >
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
