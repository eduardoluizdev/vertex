'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CompanyTabsProps {
  companyId: string;
}

const tabs = [
  { label: 'Início', segment: '' },
  { label: 'Clientes', segment: 'clientes' },
  { label: 'Serviços', segment: 'servicos' },
];

export function CompanyTabs({ companyId }: CompanyTabsProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b">
      {tabs.map((tab) => {
        const href = tab.segment
          ? `/empresas/${companyId}/${tab.segment}`
          : `/empresas/${companyId}`;
        const isActive = tab.segment
          ? pathname.startsWith(href)
          : pathname === `/empresas/${companyId}` || pathname === `/empresas/${companyId}/`;

        return (
          <Link
            key={tab.segment || 'inicio'}
            href={href}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
