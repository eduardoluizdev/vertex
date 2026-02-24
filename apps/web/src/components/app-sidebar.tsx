'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Home, 
  LogOut, 
  PanelLeft, 
  Users, 
  Briefcase, 
  LayoutDashboard,
  Settings,
  Shield,
  HelpCircle,
  ChevronDown,
  Plug2,
  Mail,
  FileText,
} from 'lucide-react';
import { CompanySelector, type CompanyOption } from '@/components/company-selector';
import { VertexHubLogo } from '@/components/vertexhub-logo';
import { SearchBar } from '@/components/sidebar/search-bar';
import { NavSection } from '@/components/sidebar/nav-section';
import { NavItem } from '@/components/sidebar/nav-item';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
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
  const [searchQuery, setSearchQuery] = useState('');
  const { data: session } = useSession();
  const pathname = usePathname();

  const userName = session?.user?.name ?? '';
  const userImage = session?.user?.image ?? undefined;
  const userEmail = session?.user?.email ?? '';

  // Filter function for search
  const filterBySearch = (label: string) => {
    if (!searchQuery) return true;
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <aside
      className={`flex h-screen flex-col border-r bg-sidebar py-4 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between px-4'}`}>
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCollapsed(false)}
                  className="flex size-10 items-center justify-center"
                >
                  <VertexHubLogo className="size-7 text-sidebar-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expandir</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            <Link href="/" className="flex items-center gap-2">
              <VertexHubLogo className="size-7 shrink-0 text-sidebar-foreground" />
              <span className="text-base font-semibold text-sidebar-foreground">
                VertexHub
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

      {/* Search Bar */}
      <div className="mt-4 px-3">
        <SearchBar onSearch={setSearchQuery} collapsed={collapsed} />
      </div>

      {/* Company Selector */}
      <div className="mt-4 px-3">
        <CompanySelector
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          collapsed={collapsed}
        />
      </div>

      {/* Navigation */}
      <TooltipProvider>
        <div className="mt-6 flex flex-1 flex-col gap-6 overflow-y-auto px-3">
          {/* MENU Section */}
          <NavSection title="MENU" collapsed={collapsed}>
            {filterBySearch('Home') && (
              <NavItem
                href="/dashboard"
                icon={Home}
                label="Home"
                isActive={pathname === '/dashboard'}
                collapsed={collapsed}
              />
            )}
            {selectedCompanyId && (
              <>
                {filterBySearch('Dashboard') && (
                  <NavItem
                    href={`/empresas/${selectedCompanyId}`}
                    icon={LayoutDashboard}
                    label="Dashboard"
                    isActive={pathname === `/empresas/${selectedCompanyId}`}
                    collapsed={collapsed}
                  />
                )}
                {filterBySearch('Clientes') && (
                  <NavItem
                    href={`/empresas/${selectedCompanyId}/clientes`}
                    icon={Users}
                    label="Clientes"
                    isActive={pathname?.includes('/clientes')}
                    collapsed={collapsed}
                  />
                )}
                {filterBySearch('Serviços') && (
                  <NavItem
                    href={`/empresas/${selectedCompanyId}/servicos`}
                    icon={Briefcase}
                    label="Serviços"
                    isActive={pathname?.includes('/servicos')}
                    collapsed={collapsed}
                  />
                )}
                {filterBySearch('Campanhas') && (
                  <NavItem
                    href="/campanhas"
                    icon={Mail}
                    label="Campanhas"
                    isActive={pathname?.includes('/campanhas')}
                    collapsed={collapsed}
                  />
                )}
                {filterBySearch('Propostas') && (
                  <NavItem
                    href="/propostas"
                    icon={FileText}
                    label="Propostas"
                    isActive={pathname?.includes('/propostas')}
                    collapsed={collapsed}
                  />
                )}
              </>
            )}
          </NavSection>

          {/* SUPORTE Section */}
          <NavSection title="SUPORTE" collapsed={collapsed}>
            {filterBySearch('Integrações') && (
              <NavItem
                href="/integracoes"
                icon={Plug2}
                label="Integrações"
                isActive={pathname === '/integracoes'}
                collapsed={collapsed}
              />
            )}
            {filterBySearch('Configurações') && (
              <NavItem
                href="/settings"
                icon={Settings}
                label="Configurações"
                isActive={pathname === '/settings'}
                collapsed={collapsed}
              />
            )}
            {filterBySearch('Segurança') && (
              <NavItem
                href="/security"
                icon={Shield}
                label="Segurança"
                isActive={pathname === '/security'}
                collapsed={collapsed}
              />
            )}
            {filterBySearch('Ajuda') && (
              <NavItem
                href="/help"
                icon={HelpCircle}
                label="Ajuda & Centro"
                isActive={pathname === '/help'}
                collapsed={collapsed}
              />
            )}
          </NavSection>
        </div>
      </TooltipProvider>

      {/* User Menu */}
      <div className="mt-auto px-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`flex w-full items-center rounded-lg py-2.5 outline-none transition-all duration-200 hover:bg-sidebar-accent ${
              collapsed ? 'justify-center px-0' : 'gap-3 px-3'
            }`}
          >
            <Avatar size="sm">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback>{getInitials(userName || 'U')}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex flex-1 flex-col items-start overflow-hidden">
                  <span className="truncate text-sm font-medium text-sidebar-foreground">
                    {userName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userEmail}
                  </span>
                </div>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </>
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
