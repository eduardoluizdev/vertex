"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  User,
} from "lucide-react";
import {
  CompanySelector,
  type CompanyOption,
} from "@/components/company-selector";
import { VertexHubLogo } from "@/components/vertexhub-logo";
import { SearchBar } from "@/components/sidebar/search-bar";
import { NavSection } from "@/components/sidebar/nav-section";
import { NavItem } from "@/components/sidebar/nav-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface AppSidebarProps {
  companies: CompanyOption[];
  selectedCompanyId: string | null;
}

export function AppSidebar({ companies, selectedCompanyId }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();
  const pathname = usePathname();

  const userName = session?.user?.name ?? "";
  const userImage = session?.user?.image ?? undefined;
  const userEmail = session?.user?.email ?? "";

  // Filter function for search
  const filterBySearch = (label: string) => {
    if (!searchQuery) return true;
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <aside
      className={`flex h-screen flex-col border-r bg-sidebar py-4 transition-all duration-300 ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center ${collapsed ? "justify-center px-3" : "justify-between px-4"}`}
      >
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCollapsed(false)}
                  className="flex size-10 items-center justify-center"
                >
                  <VertexHubLogo />
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
            {filterBySearch("Home") && (
              <NavItem
                href="/dashboard"
                icon={Home}
                label="Home"
                isActive={pathname === "/dashboard"}
                collapsed={collapsed}
              />
            )}
            {selectedCompanyId && (
              <>
                {filterBySearch("Dashboard") && (
                  <NavItem
                    href={`/empresas/${selectedCompanyId}`}
                    icon={LayoutDashboard}
                    label="Dashboard"
                    isActive={pathname === `/empresas/${selectedCompanyId}`}
                    collapsed={collapsed}
                  />
                )}
                {filterBySearch("Clientes") && (
                  <NavItem
                    href={`/empresas/${selectedCompanyId}/clientes`}
                    icon={Users}
                    label="Clientes"
                    isActive={pathname?.includes("/clientes")}
                    collapsed={collapsed}
                  />
                )}
                {filterBySearch("Serviços") && (
                  <NavItem
                    href={`/empresas/${selectedCompanyId}/servicos`}
                    icon={Briefcase}
                    label="Serviços"
                    isActive={pathname?.includes("/servicos")}
                    collapsed={collapsed}
                  />
                )}
                {filterBySearch("Campanhas") && (
                  <NavItem
                    href="/campanhas"
                    icon={Mail}
                    label="Campanhas"
                    isActive={pathname?.includes("/campanhas")}
                    collapsed={collapsed}
                  />
                )}
                {filterBySearch("Propostas") && (
                  <NavItem
                    href="/propostas"
                    icon={FileText}
                    label="Propostas"
                    isActive={pathname?.includes("/propostas")}
                    collapsed={collapsed}
                  />
                )}
              </>
            )}
          </NavSection>

          {/* SUPORTE Section */}
          <NavSection title="SUPORTE" collapsed={collapsed}>
            {filterBySearch("Integrações") && (
              <NavItem
                href="/integracoes"
                icon={Plug2}
                label="Integrações"
                isActive={pathname === "/integracoes"}
                collapsed={collapsed}
              />
            )}
            {filterBySearch("Segurança") && (
              <NavItem
                href="/security"
                icon={Shield}
                label="Segurança"
                isActive={pathname === "/security"}
                collapsed={collapsed}
              />
            )}
            {filterBySearch("Ajuda") && (
              <NavItem
                href="/help"
                icon={HelpCircle}
                label="Ajuda & Centro"
                isActive={pathname === "/help"}
                collapsed={collapsed}
              />
            )}
          </NavSection>
        </div>
      </TooltipProvider>

      {/* GitHub CTA */}
      <div className="px-3 pb-3">
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://github.com/eduardoluizdev/vertex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">Star no GitHub</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <a
            href="https://github.com/eduardoluizdev/vertex"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 transition-colors hover:bg-muted/70"
          >
            <svg
              className="size-5 shrink-0 text-sidebar-foreground"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-semibold text-sidebar-foreground">
                Open Source
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Da uma star ou fork!
              </span>
            </div>
          </a>
        )}
      </div>

      {/* WhatsApp CTA */}
      <div className="px-3 pb-3">
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://wa.me/5521993548954"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">Enviar sugestão</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <a
            href="https://wa.me/5521993548954"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-[#25D366]/20 bg-[#25D366]/5 px-3 py-2.5 transition-colors hover:bg-[#25D366]/10"
          >
            <svg
              className="size-5 shrink-0 text-[#25D366]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-semibold text-sidebar-foreground">
                Tem uma sugestão?
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Fala com a gente!
              </span>
            </div>
          </a>
        )}
      </div>

      {/* Discord CTA */}
      <div className="px-3 pb-3">
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://discord.gg/5KGWyCuJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">Entrar no Discord</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <a
            href="https://discord.gg/5KGWyCuJ"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-[#5865F2]/20 bg-[#5865F2]/5 px-3 py-2.5 transition-colors hover:bg-[#5865F2]/10"
          >
            <svg
              className="size-5 shrink-0 text-[#5865F2]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-semibold text-sidebar-foreground">
                Comunidade Discord
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Entre e conecte-se
              </span>
            </div>
          </a>
        )}
      </div>

      {/* User Menu */}
      <div className="px-3 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`flex w-full items-center rounded-lg py-2.5 outline-none transition-all duration-200 hover:bg-sidebar-accent ${
              collapsed ? "justify-center px-0" : "gap-3 px-3"
            }`}
          >
            <Avatar size="sm">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback>{getInitials(userName || "U")}</AvatarFallback>
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
            side={collapsed ? "right" : "top"}
            align={collapsed ? "end" : "start"}
            className="w-52"
          >
            <DropdownMenuItem asChild>
              <Link
                href="/perfil"
                className="flex items-center gap-2 cursor-pointer"
              >
                <User className="size-4" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-red-500 focus:text-red-500"
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
