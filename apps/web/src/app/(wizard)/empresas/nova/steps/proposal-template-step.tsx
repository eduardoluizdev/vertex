'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, SkipForward } from 'lucide-react';
import { toast } from 'sonner';
import { saveWhatsappTemplate } from '@/app/(dashboard)/propostas/_actions/proposal-actions';

const VARIABLES = [
  { key: '#PROPOSTA#', description: 'Número da proposta' },
  { key: '#CLIENTE#', description: 'Nome do cliente' },
  { key: '#VALOR#', description: 'Valor total da proposta' },
  { key: '#LINK#', description: 'Link público da proposta' },
  { key: '#EMPRESA#', description: 'Nome da empresa' },
];

const DEFAULT_TEMPLATE =
  'Olá #CLIENTE#, segue nossa proposta nº #PROPOSTA# no valor de R$ #VALOR#. Acesse: #LINK#';

interface ProposalTemplateStepProps {
  onSuccess: () => void;
  onSkip: () => void;
}

export function ProposalTemplateStep({ onSuccess, onSkip }: ProposalTemplateStepProps) {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [isPending, startTransition] = useTransition();

  const insertVariable = (variable: string) => {
    setTemplate((prev) => prev + variable);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveWhatsappTemplate(template);
        toast.success('Template salvo!');
        onSuccess();
      } catch {
        toast.error('Erro ao salvar template');
      }
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Configure a mensagem enviada ao cliente quando você disparar uma proposta pelo WhatsApp.
        Use as variáveis abaixo para personalizar o texto dinamicamente.
      </p>

      {/* Variables */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Variáveis disponíveis
        </p>
        <div className="flex flex-wrap gap-2">
          {VARIABLES.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => insertVariable(v.key)}
              title={v.description}
              className="text-xs font-mono bg-muted hover:bg-primary/10 border border-border hover:border-primary/40 text-foreground px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              {v.key}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Clique para inserir no texto da mensagem.
        </p>
      </div>

      {/* Template Textarea */}
      <Textarea
        value={template}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTemplate(e.target.value)}
        rows={4}
        placeholder="Digite sua mensagem..."
        className="font-mono text-sm"
      />

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isPending ? 'Salvando...' : 'Salvar e Continuar'}
        </Button>
        <Button
          variant="ghost"
          onClick={onSkip}
          disabled={isPending}
          className="w-full text-muted-foreground"
        >
          <SkipForward className="h-4 w-4 mr-2" />
          Pular por agora
        </Button>
      </div>
    </div>
  );
}
