'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchClient } from '@/lib/fetch-client';
import { LeadCard } from './lead-card';
import type { Lead, LeadKanbanStage, LeadListWithLeads } from '@/actions/lead-lists';

const STAGES: { id: LeadKanbanStage; label: string; color: string }[] = [
  { id: 'NOVO', label: 'Novo', color: 'bg-slate-100 dark:bg-slate-900' },
  { id: 'CONTATO_INICIAL', label: 'Contato Inicial', color: 'bg-blue-50 dark:bg-blue-950' },
  { id: 'INTERESSADO', label: 'Interessado', color: 'bg-yellow-50 dark:bg-yellow-950' },
  { id: 'PROPOSTA_ENVIADA', label: 'Proposta Enviada', color: 'bg-purple-50 dark:bg-purple-950' },
  { id: 'EM_NEGOCIACAO', label: 'Em Negociação', color: 'bg-orange-50 dark:bg-orange-950' },
  { id: 'CLIENTE', label: 'Cliente', color: 'bg-green-50 dark:bg-green-950' },
  { id: 'PERDIDO', label: 'Perdido', color: 'bg-red-50 dark:bg-red-950' },
];

interface KanbanColumnProps {
  stage: (typeof STAGES)[number];
  leads: Lead[];
  companyId: string;
}

function KanbanColumn({ stage, leads, companyId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex w-64 shrink-0 flex-col gap-2">
      <div className="flex items-center justify-between rounded-lg px-3 py-2 font-medium text-sm border bg-muted/50">
        <span>{stage.label}</span>
        <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold border">
          {leads.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-32 flex-col gap-2 rounded-lg p-2 transition-colors ${stage.color} ${
          isOver ? 'ring-2 ring-primary ring-inset' : ''
        }`}
      >
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} companyId={companyId} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">Sem leads</p>
        )}
      </div>
    </div>
  );
}

interface LeadKanbanProps {
  leadList: LeadListWithLeads;
  companyId: string;
}

export function LeadKanban({ leadList, companyId }: LeadKanbanProps) {
  const [leads, setLeads] = useState<Lead[]>(leadList.leads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(leadList.status === 'PROCESSANDO');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Poll for updates when status is PROCESSANDO
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetchClient(
          `/v1/companies/${companyId}/lead-lists/${leadList.id}`,
        );
        if (response.ok) {
          const data = await response.json();
          setLeads(data.leads);
          if (data.status !== 'PROCESSANDO') {
            setIsPolling(false);
            if (data.status === 'CONCLUIDO') {
              toast.success(`${data.leads.length} leads importados com sucesso!`);
            } else {
              toast.error('Falha ao buscar leads. Tente novamente.');
            }
          }
        }
      } catch {
        // silently ignore polling errors
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPolling, companyId, leadList.id]);

  const getLeadsForStage = useCallback(
    (stage: LeadKanbanStage) => leads.filter((l) => l.stage === stage),
    [leads],
  );

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStage = over.id as LeadKanbanStage;
    const lead = leads.find((l) => l.id === leadId);

    if (!lead || lead.stage === newStage) return;

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)),
    );

    try {
      const response = await fetchClient(
        `/v1/companies/${companyId}/lead-lists/leads/${leadId}/stage`,
        {
          method: 'PATCH',
          body: JSON.stringify({ stage: newStage }),
        },
      );
      if (!response.ok) throw new Error('Failed to update stage');
    } catch {
      // Rollback on error
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, stage: lead.stage } : l)),
      );
      toast.error('Erro ao mover lead. Tente novamente.');
    }
  }

  return (
    <div className="space-y-4">
      {isPolling && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          <Loader2 className="size-4 animate-spin" />
          <span>Buscando leads no Google Maps… A página irá atualizar automaticamente.</span>
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                leads={getLeadsForStage(stage.id)}
                companyId={companyId}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? <LeadCard lead={activeLead} companyId={companyId} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
