'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Phone, Mail, Globe, MapPin, Star, GripVertical } from 'lucide-react';
import type { Lead } from '@/actions/lead-lists';
import { LeadModal } from './lead-modal';

interface LeadCardProps {
  lead: Lead;
  companyId: string;
}

export function LeadCard({ lead, companyId }: LeadCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="rounded-lg border bg-card shadow-sm select-none hover:shadow-md transition-shadow group"
      >
        <div className="flex items-stretch">
          {/* Drag handle — only this part initiates drag */}
          <button
            {...listeners}
            className="flex items-center justify-center w-6 shrink-0 rounded-l-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/60 cursor-grab active:cursor-grabbing transition-colors"
            tabIndex={-1}
            aria-label="Arrastar"
          >
            <GripVertical className="size-3.5" />
          </button>

          {/* Clickable card body */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex-1 min-w-0 text-left p-3 pl-2"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm leading-tight line-clamp-2">
                {lead.name ?? 'Sem nome'}
              </p>
              {lead.rating !== null && (
                <span className="flex shrink-0 items-center gap-1 text-xs text-yellow-600">
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  {lead.rating.toFixed(1)}
                </span>
              )}
            </div>

            {lead.category && (
              <p className="mt-0.5 text-xs text-muted-foreground">{lead.category}</p>
            )}

            <div className="mt-2 space-y-1">
              {lead.phone && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="size-3 shrink-0" />
                  <span className="truncate">{lead.phone}</span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="size-3 shrink-0" />
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
              {lead.website && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Globe className="size-3 shrink-0" />
                  <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
                </div>
              )}
              {lead.address && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  <span className="line-clamp-1">{lead.address}</span>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      <LeadModal lead={lead} companyId={companyId} open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
