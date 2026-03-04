'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  createWhatsappTemplate,
  updateWhatsappTemplate,
  type WhatsappTemplate,
  type WhatsappTemplateCategory,
} from '@/actions/whatsapp-templates';

const CATEGORY_LABELS: Record<WhatsappTemplateCategory, string> = {
  LEAD: 'Lead',
  PROPOSTA_CRIADA: 'Proposta criada',
  PROPOSTA_ACEITA: 'Proposta aceita',
  CAMPANHA: 'Campanha',
};

const CATEGORY_VARIABLES: Record<WhatsappTemplateCategory, string[]> = {
  LEAD: ['#NOME#', '#TELEFONE#', '#EMAIL#', '#ENDERECO#', '#NICHO#'],
  PROPOSTA_CRIADA: ['#PROPOSTA#', '#CLIENTE#', '#VALOR#', '#LINK#', '#LINK_PAGAMENTO#', '#EMPRESA#'],
  PROPOSTA_ACEITA: ['#PROPOSTA#', '#CLIENTE#', '#VALOR#', '#LINK#', '#LINK_PAGAMENTO#', '#EMPRESA#'],
  CAMPANHA: ['#NOME#', '#EMPRESA#'],
};

interface TemplateFormDialogProps {
  companyId: string;
  template?: WhatsappTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TemplateFormDialog({
  companyId,
  template,
  open,
  onOpenChange,
  onSuccess,
}: TemplateFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(template?.name ?? '');
  const [category, setCategory] = useState<WhatsappTemplateCategory>(
    template?.category ?? 'PROPOSTA_CRIADA',
  );
  const [content, setContent] = useState(template?.content ?? '');

  useEffect(() => {
    if (open) {
      setName(template?.name ?? '');
      setCategory(template?.category ?? 'PROPOSTA_CRIADA');
      setContent(template?.content ?? '');
    }
  }, [open, template]);

  const isEditing = !!template;

  function insertVariable(variable: string) {
    setContent((prev) => prev + variable);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (isEditing && template) {
          await updateWhatsappTemplate(companyId, template.id, { name, content, category });
          toast.success('Template atualizado com sucesso!');
        } else {
          await createWhatsappTemplate(companyId, { name, content, category });
          toast.success('Template criado com sucesso!');
        }
        onSuccess();
        onOpenChange(false);
      } catch {
        toast.error('Erro ao salvar template. Tente novamente.');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Template' : 'Novo Template'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Primeiro contato"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as WhatsappTemplateCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_LABELS) as WhatsappTemplateCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Variáveis disponíveis</Label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_VARIABLES[category].map((variable) => (
                <button
                  key={variable}
                  type="button"
                  onClick={() => insertVariable(variable)}
                  className="rounded border bg-muted px-2 py-0.5 text-xs font-mono hover:bg-muted/80 transition-colors"
                >
                  {variable}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Olá #NOME#, tudo bem?"
              className="font-mono min-h-32 resize-y"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
