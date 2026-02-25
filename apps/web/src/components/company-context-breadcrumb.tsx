import { getSelectedCompanyId } from '@/lib/cookies';
import { apiClient } from '@/lib/api';
import { Breadcrumb, type BreadcrumbItem } from '@/components/breadcrumb';

interface CompanyContextBreadcrumbProps {
  items: BreadcrumbItem[];
}

export async function CompanyContextBreadcrumb({ items }: CompanyContextBreadcrumbProps) {
  const companyId = await getSelectedCompanyId();
  let companyName = '';
  
  if (companyId) {
    const response = await apiClient(`/v1/companies/${companyId}`);
    if (response.ok) {
      const company = await response.json();
      companyName = company.name;
    }
  }

  const baseItems: BreadcrumbItem[] = [
    { label: 'Empresas', href: '/empresas' }
  ];

  if (companyName && companyId) {
    baseItems.push({ label: companyName, href: `/empresas/${companyId}` });
  }

  return <Breadcrumb items={[...baseItems, ...items]} />;
}
