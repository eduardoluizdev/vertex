'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, Link } from 'lucide-react';
import { toast } from 'sonner';
import { saveProposalIntegration } from '@/app/(dashboard)/propostas/_actions/proposal-actions';

interface ProposalIntegrationFormProps {
  initialWebUrl?: string;
}

export function ProposalIntegrationForm({ initialWebUrl }: ProposalIntegrationFormProps) {
  const [webUrl, setWebUrl] = useState(initialWebUrl ?? '');
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!webUrl.trim()) {
      toast.error('Informe a URL pública da aplicação');
      return;
    }
    startTransition(async () => {
      try {
        await saveProposalIntegration(webUrl.trim().replace(/\/$/, ''));
        toast.success('URL salva com sucesso!');
      } catch {
        toast.error('Erro ao salvar URL');
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="web-url" className="flex items-center gap-2">
          <Link className="h-4 w-4 text-muted-foreground" />
          URL base da aplicação
        </Label>
        <p className="text-xs text-muted-foreground">
          Usada para gerar o link público da proposta enviado ao cliente. Ex:{' '}
          <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">https://app.vertexhub.dev</code>
        </p>
        <div className="flex gap-2 items-center">
          <Input
            id="web-url"
            type="url"
            value={webUrl}
            onChange={(e) => setWebUrl(e.target.value)}
            placeholder="https://app.seudominio.com"
            className="font-mono text-sm"
          />
          <Button onClick={handleSave} disabled={isPending} size="sm" className="shrink-0">
            <Save className="h-4 w-4 mr-2" />
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
        {webUrl && (
          <p className="text-xs text-muted-foreground">
            Link gerado:{' '}
            <code className="font-mono">{webUrl.replace(/\/$/, '')}/p/&lt;token&gt;</code>
          </p>
        )}
      </div>
    </div>
  );
}
