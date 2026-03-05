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
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  createWhatsappTemplate,
  updateWhatsappTemplate,
  generateWhatsappTemplateContent,
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
  LEAD: ['#NOME#', '#TELEFONE#', '#EMAIL#', '#ENDERECO#', '#NICHO#', '#EMPRESA#'],
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [name, setName] = useState(template?.name ?? '');
  const [category, setCategory] = useState<WhatsappTemplateCategory>(
    template?.category ?? 'PROPOSTA_CRIADA',
  );
  const [content, setContent] = useState(template?.content ?? '');
  const [aiContext, setAiContext] = useState('');

  useEffect(() => {
    if (open) {
      setName(template?.name ?? '');
      setCategory(template?.category ?? 'PROPOSTA_CRIADA');
      setContent(template?.content ?? '');
      setAiContext('');
    }
  }, [open, template]);

  const isEditing = !!template;

  function insertVariable(variable: string) {
    setContent((prev) => prev + variable);
  }

  async function handleGenerate() {
    if (!name.trim()) {
      toast.error('Preencha o nome do template antes de gerar com IA.');
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateWhatsappTemplateContent(companyId, { name, category, context: aiContext || undefined });
      setContent(result.content);
      toast.success('Conteúdo gerado com sucesso!');
    } catch {
      toast.error('Erro ao gerar conteúdo com Gemini.');
    } finally {
      setIsGenerating(false);
    }
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
            <Label htmlFor="ai-context">Contexto para IA (opcional)</Label>
            <Textarea
              id="ai-context"
              value={aiContext}
              onChange={(e) => setAiContext(e.target.value)}
              placeholder="Ex: somos uma agência de marketing digital, tom descontraído, foco em conversão..."
              className="min-h-16 resize-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Conteúdo</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating || isPending}
                className="h-7 gap-1.5 text-xs"
              >
                {isGenerating ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                {isGenerating ? 'Gerando...' : 'Gerar com Gemini'}
              </Button>
            </div>
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
