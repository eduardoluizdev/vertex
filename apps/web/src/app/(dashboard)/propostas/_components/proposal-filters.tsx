'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  APPROVED: 'Aprovado',
  REJECTED: 'Reprovado',
};

interface ProposalFiltersProps {
  customers: any[];
  currentFilters: {
    customerId?: string;
    status?: string;
    followUpDate?: string;
  };
}

export function ProposalFilters({ customers, currentFilters }: ProposalFiltersProps) {
  const router = useRouter();

  const setFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams();
    if (currentFilters.customerId && key !== 'customerId') params.set('customerId', currentFilters.customerId);
    if (currentFilters.status && key !== 'status') params.set('status', currentFilters.status);
    if (currentFilters.followUpDate && key !== 'followUpDate') params.set('followUpDate', currentFilters.followUpDate);
    if (value) params.set(key, value);
    router.push(`/propostas${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const hasFilters = currentFilters.customerId || currentFilters.status || currentFilters.followUpDate;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select
        value={currentFilters.customerId ?? ''}
        onValueChange={(v) => setFilter('customerId', v || undefined)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrar por cliente" />
        </SelectTrigger>
        <SelectContent>
          {customers.map((c: any) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFilters.status ?? ''}
        onValueChange={(v) => setFilter('status', v || undefined)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-[180px]"
        value={currentFilters.followUpDate ?? ''}
        onChange={(e) => setFilter('followUpDate', e.target.value || undefined)}
        placeholder="Data de follow-up"
      />

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/propostas')}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
