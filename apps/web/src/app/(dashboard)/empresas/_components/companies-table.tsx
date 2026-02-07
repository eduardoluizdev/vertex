'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { fetchClient } from '@/lib/fetch-client';
import { DataTable } from '@/components/ui/data-table';
import { getColumns, Company } from './columns';
import { DeleteCompanyDialog } from './delete-company-dialog';

interface CompaniesTableProps {
  data: Company[];
}

export function CompaniesTable({ data }: CompaniesTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  const columns = getColumns((company) => setDeleteTarget(company));

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      const response = await fetchClient(
        `/v1/companies/${deleteTarget.id}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        throw new Error('Erro ao excluir empresa');
      }

      toast.success('Empresa excluída com sucesso');
      router.refresh();
    } catch {
      toast.error('Erro ao excluir empresa');
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <DataTable columns={columns} data={data} />
      <DeleteCompanyDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        companyName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
      />
    </>
  );
}
