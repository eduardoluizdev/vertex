'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  MessageCircle,
  ExternalLink,
  Users,
  Send,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Lead, LeadKanbanStage } from '@/actions/lead-lists';
import {
  getWhatsappTemplates,
  sendLeadWhatsapp,
  type WhatsappTemplate,
} from '@/actions/whatsapp-templates';

const STAGE_LABELS: Record<LeadKanbanStage, string> = {
  NOVO: 'Novo',
  CONTATO_INICIAL: 'Contato Inicial',
  INTERESSADO: 'Interessado',
  PROPOSTA_ENVIADA: 'Proposta Enviada',
  EM_NEGOCIACAO: 'Em Negociação',
  CLIENTE: 'Cliente',
  PERDIDO: 'Perdido',
};

const STAGE_COLORS: Record<LeadKanbanStage, string> = {
  NOVO: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  CONTATO_INICIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  INTERESSADO: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  PROPOSTA_ENVIADA: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  EM_NEGOCIACAO: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  CLIENTE: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  PERDIDO: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

interface LeadModalProps {
  lead: Lead | null;
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0">
      <div className="mt-0.5 rounded-md bg-muted p-1.5">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1 truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {value}
            <ExternalLink className="size-3 shrink-0" />
          </a>
        ) : (
          <p className="text-sm font-medium break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

function replaceVariables(content: string, lead: Lead): string {
  return content
    .replace(/#NOME#/g, lead.name ?? '')
    .replace(/#TELEFONE#/g, lead.phone ?? '')
    .replace(/#EMAIL#/g, lead.email ?? '')
    .replace(/#ENDERECO#/g, lead.address ?? '')
    .replace(/#NICHO#/g, lead.category ?? '');
}

interface SendWhatsappDialogProps {
  lead: Lead;
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SendWhatsappDialog({ lead, companyId, open, onOpenChange }: SendWhatsappDialogProps) {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsappTemplate | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      getWhatsappTemplates(companyId, 'LEAD').then(setTemplates);
      setSelectedTemplate(null);
    }
  }, [open, companyId]);

  function handleSend() {
    if (!selectedTemplate) return;
    startTransition(async () => {
      try {
        await sendLeadWhatsapp(companyId, lead.id, selectedTemplate.id);
        toast.success('Mensagem enviada com sucesso!');
        onOpenChange(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        if (message.includes('not connected') || message.includes('WhatsApp')) {
          toast.error('WhatsApp não está conectado. Verifique as integrações.');
        } else {
          toast.error('Erro ao enviar mensagem. Tente novamente.');
        }
      }
    });
  }

  const preview = selectedTemplate ? replaceVariables(selectedTemplate.content, lead) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar via WhatsApp</DialogTitle>
        </DialogHeader>

        {templates.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <p>Nenhum template de LEAD cadastrado.</p>
            <p className="mt-1 text-xs">Crie templates em <strong>Templates</strong> no menu lateral.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Selecione um template</p>
              <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-lg border p-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTemplate(t)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      selectedTemplate?.id === t.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{t.name}</span>
                      <ChevronRight className="size-4 shrink-0 opacity-50" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {preview && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Preview</p>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="font-mono text-xs whitespace-pre-wrap">{preview}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={!selectedTemplate || isPending}
              >
                <Send className="size-4" />
                {isPending ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function LeadModal({ lead, companyId, open, onOpenChange }: LeadModalProps) {
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  if (!lead) return null;

  const rawData = lead.rawData as Record<string, unknown>;
  const reviewCount = lead.reviewCount ?? (rawData['reviewsCount'] as number) ?? null;
  const mapsUrl = (rawData['url'] as string) ?? (rawData['googleMapsUrl'] as string) ?? null;

  const whatsappPhone = lead.phone?.replace(/\D/g, '');
  const whatsappUrl = whatsappPhone ? `https://wa.me/${whatsappPhone}` : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-3 pr-6">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base leading-snug">
                  {lead.name ?? 'Sem nome'}
                </DialogTitle>
                {lead.category && (
                  <p className="text-sm text-muted-foreground mt-0.5">{lead.category}</p>
                )}
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STAGE_COLORS[lead.stage]}`}>
                {STAGE_LABELS[lead.stage]}
              </span>
            </div>

            {lead.rating !== null && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < Math.round(lead.rating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">{lead.rating.toFixed(1)}</span>
                {reviewCount !== null && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3" />
                    {reviewCount.toLocaleString('pt-BR')} avaliações
                  </span>
                )}
              </div>
            )}
          </DialogHeader>

          <div className="mt-1 divide-y divide-border rounded-lg border px-3">
            {lead.phone && (
              <InfoRow icon={Phone} label="Telefone" value={lead.phone} />
            )}
            {lead.email && (
              <InfoRow
                icon={Mail}
                label="Email"
                value={lead.email}
                href={`mailto:${lead.email}`}
              />
            )}
            {lead.website && (
              <InfoRow
                icon={Globe}
                label="Site"
                value={lead.website.replace(/^https?:\/\//, '')}
                href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
              />
            )}
            {lead.address && (
              <InfoRow icon={MapPin} label="Endereço" value={lead.address} />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {lead.phone && (
              <Button
                variant="outline"
                size="sm"
                className="border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 hover:text-[#25D366]"
                onClick={() => setSendDialogOpen(true)}
              >
                <MessageCircle className="size-4" />
                Enviar via WhatsApp
              </Button>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <ExternalLink className="size-4" />
                Abrir WhatsApp
              </a>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <MapPin className="size-4" />
                Ver no Google Maps
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SendWhatsappDialog
        lead={lead}
        companyId={companyId}
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
      />
    </>
  );
}
