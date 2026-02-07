'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { fetchClient } from '@/lib/fetch-client';
import { DataTable } from '@/components/ui/data-table';
import { getColumns, Customer } from './columns';
import { DeleteCustomerDialog } from './delete-customer-dialog';

interface CustomersTableProps {
  companyId: string;
  data: Customer[];
}

export function CustomersTable({ companyId, data }: CustomersTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const columns = getColumns(companyId, (customer) => setDeleteTarget(customer));

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      const response = await fetchClient(
        `/v1/companies/${companyId}/customers/${deleteTarget.id}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        throw new Error('Erro ao excluir cliente');
      }

      toast.success('Cliente excluído com sucesso');
      router.refresh();
    } catch {
      toast.error('Erro ao excluir cliente');
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <DataTable columns={columns} data={data} />
      <DeleteCustomerDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        customerName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
      />
    </>
  );
}
