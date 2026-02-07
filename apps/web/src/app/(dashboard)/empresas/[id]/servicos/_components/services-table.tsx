'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { fetchClient } from '@/lib/fetch-client';
import { DataTable } from '@/components/ui/data-table';
import { getColumns, Service } from './columns';
import { DeleteServiceDialog } from './delete-service-dialog';

interface ServicesTableProps {
  companyId: string;
  data: Service[];
}

export function ServicesTable({ companyId, data }: ServicesTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const columns = getColumns(companyId, (service) => setDeleteTarget(service));

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      const response = await fetchClient(
        `/v1/companies/${companyId}/services/${deleteTarget.id}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        throw new Error('Erro ao excluir serviço');
      }

      toast.success('Serviço excluído com sucesso');
      router.refresh();
    } catch {
      toast.error('Erro ao excluir serviço');
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <DataTable columns={columns} data={data} />
      <DeleteServiceDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        serviceName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
      />
    </>
  );
}
