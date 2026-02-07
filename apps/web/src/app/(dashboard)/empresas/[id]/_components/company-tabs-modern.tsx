'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Briefcase } from 'lucide-react';

interface CompanyTabsModernProps {
  companyId: string;
}

const tabs = [
  {
    label: 'Dashboard',
    segment: '',
    icon: LayoutDashboard,
    gradient: 'from-violet-500 to-purple-600',
    color: 'violet',
  },
  {
    label: 'Clientes',
    segment: 'clientes',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-600',
    color: 'blue',
  },
  {
    label: 'Serviços',
    segment: 'servicos',
    icon: Briefcase,
    gradient: 'from-emerald-500 to-teal-600',
    color: 'emerald',
  },
];

export function CompanyTabsModern({ companyId }: CompanyTabsModernProps) {
  const pathname = usePathname();

  return (
    <div className="relative">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const href = tab.segment
            ? `/empresas/${companyId}/${tab.segment}`
            : `/empresas/${companyId}`;
          const isActive = tab.segment
            ? pathname.startsWith(href)
            : pathname === `/empresas/${companyId}` ||
              pathname === `/empresas/${companyId}/`;

          const Icon = tab.icon;

          return (
            <Link
              key={tab.segment || 'dashboard'}
              href={href}
              className={cn(
                'group relative flex items-center gap-2 rounded-t-xl px-6 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {/* Active gradient background */}
              {isActive && (
                <div
                  className={cn(
                    'absolute inset-0 rounded-t-xl bg-gradient-to-br opacity-[0.08]',
                    tab.gradient
                  )}
                />
              )}

              {/* Icon with colored background */}
              <div
                className={cn(
                  'relative rounded-lg p-1.5 transition-all',
                  isActive
                    ? `bg-${tab.color}-100 dark:bg-${tab.color}-950`
                    : 'bg-muted group-hover:bg-muted-foreground/10'
                )}
              >
                <Icon
                  className={cn(
                    'size-4 transition-colors',
                    isActive
                      ? `text-${tab.color}-600 dark:text-${tab.color}-400`
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
              </div>

              {/* Label */}
              <span className="relative">{tab.label}</span>

              {/* Active indicator bar */}
              {isActive && (
                <div
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r',
                    tab.gradient
                  )}
                />
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Bottom border */}
      <div className="h-px bg-border" />
    </div>
  );
}
