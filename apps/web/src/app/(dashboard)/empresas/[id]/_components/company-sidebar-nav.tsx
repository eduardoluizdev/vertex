'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Briefcase } from 'lucide-react';

interface CompanySidebarNavProps {
  companyId: string;
}

const navItems = [
  {
    label: 'Dashboard',
    segment: '',
    icon: LayoutDashboard,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    label: 'Clientes',
    segment: 'clientes',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    label: 'Serviços',
    segment: 'servicos',
    icon: Briefcase,
    gradient: 'from-emerald-500 to-teal-600',
  },
];

export function CompanySidebarNav({ companyId }: CompanySidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const href = item.segment
          ? `/empresas/${companyId}/${item.segment}`
          : `/empresas/${companyId}`;
        const isActive = item.segment
          ? pathname.startsWith(href)
          : pathname === `/empresas/${companyId}` || pathname === `/empresas/${companyId}/`;

        const Icon = item.icon;

        return (
          <Link
            key={item.segment || 'dashboard'}
            href={href}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
              isActive
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {/* Active indicator bar */}
            {isActive && (
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-90',
                    item.gradient
                  )}
                />
              </div>
            )}

            {/* Icon */}
            <div className="relative z-10 flex items-center gap-3">
              <div
                className={cn(
                  'rounded-lg p-1.5 transition-all',
                  isActive
                    ? 'bg-white/20'
                    : 'bg-muted group-hover:bg-muted-foreground/10'
                )}
              >
                <Icon className="size-4" />
              </div>
              <span className="relative">{item.label}</span>
            </div>

            {/* Hover gradient overlay for inactive items */}
            {!isActive && (
              <div className="absolute inset-0 overflow-hidden rounded-xl opacity-0 transition-opacity group-hover:opacity-5">
                <div
                  className={cn('absolute inset-0 bg-gradient-to-br', item.gradient)}
                />
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
