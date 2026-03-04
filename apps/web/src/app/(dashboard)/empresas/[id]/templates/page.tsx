'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getWhatsappTemplates,
  deleteWhatsappTemplate,
  type WhatsappTemplate,
  type WhatsappTemplateCategory,
} from '@/actions/whatsapp-templates';
import { TemplateFormDialog } from './_components/template-form-dialog';
import { use } from 'react';

const CATEGORY_LABELS: Record<WhatsappTemplateCategory, string> = {
  LEAD: 'Lead',
  PROPOSTA_CRIADA: 'Proposta criada',
  PROPOSTA_ACEITA: 'Proposta aceita',
  CAMPANHA: 'Campanha',
};

const CATEGORY_COLORS: Record<WhatsappTemplateCategory, string> = {
  LEAD: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  PROPOSTA_CRIADA: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  PROPOSTA_ACEITA: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  CAMPANHA: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
};

const ALL_CATEGORIES: (WhatsappTemplateCategory | 'TODOS')[] = [
  'TODOS',
  'LEAD',
  'PROPOSTA_CRIADA',
  'PROPOSTA_ACEITA',
  'CAMPANHA',
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TemplatesPage({ params }: PageProps) {
  const { id: companyId } = use(params);

  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [activeFilter, setActiveFilter] = useState<WhatsappTemplateCategory | 'TODOS'>('TODOS');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsappTemplate | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadTemplates = useCallback(() => {
    startTransition(async () => {
      const data = await getWhatsappTemplates(companyId);
      setTemplates(data);
    });
  }, [companyId]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  function handleEdit(template: WhatsappTemplate) {
    setEditingTemplate(template);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditingTemplate(null);
    setDialogOpen(true);
  }

  async function handleDelete(template: WhatsappTemplate) {
    if (!confirm(`Deletar o template "${template.name}"?`)) return;
    try {
      await deleteWhatsappTemplate(companyId, template.id);
      toast.success('Template removido.');
      loadTemplates();
    } catch {
      toast.error('Erro ao remover template.');
    }
  }

  const filtered =
    activeFilter === 'TODOS'
      ? templates
      : templates.filter((t) => t.category === activeFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2 dark:bg-green-950">
            <MessageSquare className="size-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Templates WhatsApp</h1>
            <p className="text-sm text-muted-foreground">
              Crie e gerencie templates de mensagens reutilizáveis
            </p>
          </div>
        </div>
        <Button onClick={handleNew} size="sm">
          <Plus className="size-4" />
          Novo Template
        </Button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 border-b pb-1">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === cat
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {cat === 'TODOS' ? 'Todos' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      {isPending ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <MessageSquare className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Nenhum template encontrado.</p>
          <Button onClick={handleNew} variant="outline" size="sm">
            <Plus className="size-4" />
            Criar primeiro template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{template.name}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[template.category]}`}
                  >
                    {CATEGORY_LABELS[template.category]}
                  </span>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => handleEdit(template)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(template)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              <p className="line-clamp-3 font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                {template.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <TemplateFormDialog
        companyId={companyId}
        template={editingTemplate}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadTemplates}
      />
    </div>
  );
}
