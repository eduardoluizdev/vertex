"use client"

import { usePathname } from 'next/navigation';
import { Breadcrumb, type BreadcrumbItem } from '@/components/breadcrumb';

interface CompanyBreadcrumbProps {
  companyId: string;
  companyName: string;
}

export function CompanyBreadcrumb({ companyId, companyName }: CompanyBreadcrumbProps) {
  const pathname = usePathname();

  const items: BreadcrumbItem[] = [
    { label: 'Empresas', href: '/empresas' },
  ];

  if (pathname.endsWith('/clientes')) {
    items.push({ label: companyName, href: `/empresas/${companyId}` });
    items.push({ label: 'Clientes' });
  } else if (pathname.endsWith('/servicos')) {
    items.push({ label: companyName, href: `/empresas/${companyId}` });
    items.push({ label: 'Serviços' });
  } else if (pathname.endsWith('/editar')) {
    items.push({ label: companyName, href: `/empresas/${companyId}` });
    items.push({ label: 'Editar' });
  } else {
    // Just the dashboard/overview
    items.push({ label: companyName });
  }

  return <Breadcrumb items={items} />;
}
