'use client';

import { useState, useTransition } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { saveWhatsappTemplate } from '@/app/(dashboard)/propostas/_actions/proposal-actions';

const VARIABLES = [
  { key: '#PROPOSTA#', description: 'Número da proposta' },
  { key: '#CLIENTE#', description: 'Nome do cliente' },
  { key: '#VALOR#', description: 'Valor total da proposta' },
  { key: '#LINK#', description: 'Link público da proposta' },
  { key: '#LINK_PAGAMENTO#', description: 'Link de pagamento Pix (Asaas)' },
  { key: '#EMPRESA#', description: 'Nome da empresa' },
];

interface WhatsappTemplateFormProps {
  initialTemplate?: string;
  initialFollowUpTemplate?: string;
  initialApprovedTemplate?: string;
}

export function WhatsappTemplateForm({ initialTemplate, initialFollowUpTemplate, initialApprovedTemplate }: WhatsappTemplateFormProps) {
  const [template, setTemplate] = useState(
    initialTemplate ??
      'Olá #CLIENTE#, segue nossa proposta nº #PROPOSTA# no valor de R$ #VALOR#. Acesse: #LINK#',
  );
  const [followUpTemplate, setFollowUpTemplate] = useState(
    initialFollowUpTemplate ??
      'Olá #CLIENTE#, tudo bem? Gostaria de saber se conseguiu avaliar nossa proposta nº #PROPOSTA# no valor de R$ #VALOR#. Qualquer dúvida estou à disposição!',
  );
  const [approvedTemplate, setApprovedTemplate] = useState(
    initialApprovedTemplate ??
      'Olá #CLIENTE#! 🎉\n\nSua proposta nº #PROPOSTA# foi aprovada!\n\n💰 Valor: R$ #VALOR#\n\n📋 Dados para pagamento:\n#LINK_PAGAMENTO#\n\nObrigado pela confiança!\n#EMPRESA#',
  );
  const [activeField, setActiveField] = useState<'template' | 'followUp' | 'approved'>('template');
  const [isPending, startTransition] = useTransition();

  const insertVariable = (variable: string) => {
    if (activeField === 'template') {
      setTemplate((prev) => prev + variable);
    } else if (activeField === 'followUp') {
      setFollowUpTemplate((prev) => prev + variable);
    } else {
      setApprovedTemplate((prev) => prev + variable);
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveWhatsappTemplate(template, followUpTemplate, approvedTemplate);
        toast.success('Templates salvos com sucesso!');
      } catch {
        toast.error('Erro ao salvar templates');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {VARIABLES.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => insertVariable(v.key)}
            className="text-xs font-mono bg-muted hover:bg-primary/10 border border-border hover:border-primary/40 text-foreground px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            title={v.description}
          >
            {v.key}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Clique nas variáveis acima para inserir no texto.
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium">Mensagem de Envio de Proposta</label>
        <Textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          onFocus={() => setActiveField('template')}
          rows={20}
          placeholder="Digite a mensagem de envio..."
          className={`font-mono text-sm ${activeField === 'template' ? 'border-primary' : ''}`}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Mensagem de Follow-up</label>
        <Textarea
          value={followUpTemplate}
          onChange={(e) => setFollowUpTemplate(e.target.value)}
          onFocus={() => setActiveField('followUp')}
          rows={20}
          placeholder="Digite a mensagem de follow-up..."
          className={`font-mono text-sm ${activeField === 'followUp' ? 'border-primary' : ''}`}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Mensagem de Aprovação (Automática)</label>
        <p className="text-xs text-muted-foreground">
          Esta mensagem será enviada automaticamente quando o cliente aprovar a proposta.
        </p>
        <Textarea
          value={approvedTemplate}
          onChange={(e) => setApprovedTemplate(e.target.value)}
          onFocus={() => setActiveField('approved')}
          rows={20}
          placeholder="Digite a mensagem de aprovação..."
          className={`font-mono text-sm ${activeField === 'approved' ? 'border-primary' : ''}`}
        />
      </div>

      <Button onClick={handleSave} disabled={isPending} size="sm">
        <Save className="h-4 w-4 mr-2" />
        {isPending ? 'Salvando...' : 'Salvar Templates'}
      </Button>
    </div>
  );
}
