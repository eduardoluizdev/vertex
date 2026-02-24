'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Save,
  Globe,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { saveProposalIntegration } from '@/app/(dashboard)/propostas/_actions/proposal-actions';

const APP_HOST = 'app.vertexhub.dev';

interface ProposalIntegrationFormProps {
  initialWebUrl?: string;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button type="button" onClick={copy} title="Copiar"
      className="ml-2 text-muted-foreground hover:text-foreground transition-colors shrink-0">
      {copied
        ? <Check className="size-3.5 text-emerald-400" />
        : <Copy className="size-3.5" />}
    </button>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 border border-violet-500/30 text-xs font-bold text-violet-400">
      {n}
    </div>
  );
}

function CodeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
      <span className="text-xs text-muted-foreground mr-2">{label}:</span>
      <div className="flex items-center flex-1 justify-end">
        <code className="font-mono text-xs text-foreground/90">{value}</code>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

type Provider = 'cloudflare' | 'registrobr' | 'godaddy' | 'locaweb' | 'hostgator';

const PROVIDERS: { id: Provider; label: string; flag: string }[] = [
  { id: 'cloudflare', label: 'Cloudflare', flag: '☁️' },
  { id: 'registrobr', label: 'Registro.br', flag: '🇧🇷' },
  { id: 'godaddy', label: 'GoDaddy', flag: '🟢' },
  { id: 'locaweb', label: 'Locaweb', flag: '🔵' },
  { id: 'hostgator', label: 'HostGator', flag: '🟠' },
];

const PROVIDER_STEPS: Record<Provider, { title: string; steps: { action: string; detail?: string }[]; tip?: string; loginUrl: string }> = {
  cloudflare: {
    loginUrl: 'https://dash.cloudflare.com',
    title: 'Cloudflare',
    steps: [
      { action: 'Acesse dash.cloudflare.com e faça login' },
      { action: 'Selecione o seu domínio na lista' },
      { action: 'Clique em "DNS" no menu lateral esquerdo' },
      { action: 'Clique no botão azul "Add record"' },
      {
        action: 'Preencha o formulário:',
        detail: 'Type: CNAME  |  Name: propostas  |  Target: ' + APP_HOST + '  |  TTL: Auto'
      },
      {
        action: '⚠️ IMPORTANTE: Desative o proxy (ícone laranja ☁️ → cinza ☁️)',
        detail: 'Clique no ícone de nuvem laranja para deixá-la cinza. Se deixar laranja, o CNAME não vai funcionar corretamente.'
      },
      { action: 'Clique em "Save"' },
    ],
    tip: 'Cloudflare propaga em poucos minutos quando o proxy está desativado (ícone cinza).',
  },
  registrobr: {
    loginUrl: 'https://registro.br',
    title: 'Registro.br',
    steps: [
      { action: 'Acesse registro.br e faça login' },
      { action: 'Clique em "Meus Domínios" e selecione o domínio desejado' },
      { action: 'Vá em "Editar Zona" ou "DNS"' },
      { action: 'Clique em "Adicionar entrada"' },
      {
        action: 'Escolha o tipo "CNAME" e preencha:',
        detail: 'Nome do host: propostas  |  Destino: ' + APP_HOST
      },
      { action: 'Clique em "Adicionar" e depois em "Salvar"' },
    ],
    tip: 'O Registro.br pode demorar até 24h para propagar, mas costuma resolver em 1-2h.',
  },
  godaddy: {
    loginUrl: 'https://dcc.godaddy.com',
    title: 'GoDaddy',
    steps: [
      { action: 'Acesse dcc.godaddy.com e faça login' },
      { action: 'Vá em "Meus Produtos" → ao lado do domínio clique em "DNS"' },
      { action: 'Role até a seção "CNAME" e clique em "Adicionar"' },
      {
        action: 'Preencha os campos:',
        detail: 'Host: propostas  |  Aponta para: ' + APP_HOST + '  |  TTL: 1 hora'
      },
      { action: 'Clique em "Salvar"' },
    ],
    tip: 'GoDaddy geralmente propaga em 30 minutos a 1 hora.',
  },
  locaweb: {
    loginUrl: 'https://painel.locaweb.com.br',
    title: 'Locaweb',
    steps: [
      { action: 'Acesse painel.locaweb.com.br e faça login' },
      { action: 'Clique em "Domínios" e selecione o domínio' },
      { action: 'Vá em "DNS" ou "Zona DNS"' },
      { action: 'Clique em "Adicionar registro" e selecione "CNAME"' },
      {
        action: 'Preencha:',
        detail: 'Subdomínio (host): propostas  |  Destino: ' + APP_HOST
      },
      { action: 'Clique em "Confirmar"' },
    ],
    tip: 'Locaweb costuma propagar em 1-4 horas.',
  },
  hostgator: {
    loginUrl: 'https://financeiro.hostgator.com.br',
    title: 'HostGator',
    steps: [
      { action: 'Acesse o painel da HostGator e faça login' },
      { action: 'Vá em "Domínios" → "Gerenciar DNS"' },
      { action: 'Selecione "CNAME Records" e clique em "Adicionar Registro"' },
      {
        action: 'Preencha:',
        detail: 'Nome: propostas  |  TTL: 14400  |  Destino: ' + APP_HOST
      },
      { action: 'Clique em "Add Record"' },
    ],
    tip: 'HostGator pode demorar até 24h, mas normalmente propaga em 1-2h.',
  },
};

export function ProposalIntegrationForm({ initialWebUrl }: ProposalIntegrationFormProps) {
  const [webUrl, setWebUrl] = useState(initialWebUrl ?? '');
  const [isPending, startTransition] = useTransition();
  const [showGuide, setShowGuide] = useState(!initialWebUrl);
  const [activeProvider, setActiveProvider] = useState<Provider>('cloudflare');

  const handleSave = () => {
    if (!webUrl.trim()) {
      toast.error('Informe a URL do domínio');
      return;
    }
    startTransition(async () => {
      try {
        await saveProposalIntegration(webUrl.trim().replace(/\/$/, ''));
        toast.success('Domínio salvo! Os links de proposta já usam este endereço.');
      } catch {
        toast.error('Erro ao salvar domínio');
      }
    });
  };

  const previewLink = webUrl
    ? `${webUrl.replace(/\/$/, '')}/p/<token>`
    : 'https://propostas.suaempresa.com.br/p/<token>';

  const currentProvider = PROVIDER_STEPS[activeProvider];

  return (
    <div className="space-y-6">

      {/* URL input */}
      <div className="space-y-2">
        <Label htmlFor="web-url" className="flex items-center gap-2 text-sm font-medium">
          <Globe className="size-4 text-blue-400" />
          Domínio configurado
        </Label>
        <div className="flex gap-2 items-center">
          <Input
            id="web-url"
            type="url"
            value={webUrl}
            onChange={(e) => setWebUrl(e.target.value)}
            placeholder="https://propostas.suaempresa.com.br"
            className="font-mono text-sm"
          />
          <Button
            onClick={handleSave}
            disabled={isPending}
            size="sm"
            className="shrink-0 gap-1.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-0"
          >
            <Save className="size-3.5" />
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/30 border border-border/50 px-3 py-2">
          <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Link da proposta:{' '}
            <code className="font-mono text-foreground/70">{previewLink}</code>
          </p>
        </div>
      </div>

      {/* DNS Records needed */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-violet-400 shrink-0" />
          <p className="text-sm font-semibold text-foreground">Registro DNS a ser criado</p>
        </div>
        <div className="grid gap-2">
          <CodeBox label="Tipo" value="CNAME" />
          <CodeBox label="Nome / Host" value="propostas" />
          <CodeBox label="Destino / Valor" value={APP_HOST} />
          <CodeBox label="TTL" value="Auto (ou 3600)" />
        </div>
        <p className="text-xs text-muted-foreground">
          O nome <code className="font-mono bg-muted px-1 py-0.5 rounded text-[11px]">propostas</code> é uma sugestão — você pode usar qualquer subdomínio (ex: <code className="font-mono bg-muted px-1 py-0.5 rounded text-[11px]">links</code>, <code className="font-mono bg-muted px-1 py-0.5 rounded text-[11px]">clientes</code>, etc.).
        </p>
      </div>

      {/* Tutorial by provider */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setShowGuide((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
        >
          <span className="text-sm font-semibold text-foreground">
            📖 Tutorial passo a passo por provedor DNS
          </span>
          {showGuide
            ? <ChevronUp className="size-4 text-muted-foreground" />
            : <ChevronDown className="size-4 text-muted-foreground" />}
        </button>

        {showGuide && (
          <div className="p-4 space-y-4">

            {/* Provider tabs */}
            <div className="flex flex-wrap gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveProvider(p.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                    activeProvider === p.id
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                      : 'bg-muted/20 border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  <span>{p.flag}</span>
                  {p.label}
                </button>
              ))}
            </div>

            {/* Steps for active provider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {currentProvider.title}
                </p>
                <a
                  href={currentProvider.loginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Abrir painel <ExternalLink className="size-3" />
                </a>
              </div>

              <ol className="space-y-3">
                {currentProvider.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <StepBadge n={i + 1} />
                    <div className="flex-1 space-y-1.5">
                      <p className="text-sm text-foreground">{step.action}</p>
                      {step.detail && (
                        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                          <code className="font-mono text-xs text-foreground/80 break-all">
                            {step.detail}
                          </code>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>

              {currentProvider.tip && (
                <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2.5">
                  <Info className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300">{currentProvider.tip}</p>
                </div>
              )}
            </div>

            {/* Verify DNS */}
            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-xs font-semibold text-foreground">Verificar propagação do DNS</p>
              <p className="text-xs text-muted-foreground">
                Após criar o registro, verifique se propagou usando o site abaixo. Busque pelo seu subdomínio e procure pelo tipo <strong>CNAME</strong>:
              </p>
              <a
                href="https://dnschecker.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
              >
                <Globe className="size-3.5" />
                dnschecker.org
                <ExternalLink className="size-3" />
              </a>
            </div>

            {/* Final step */}
            <div className="border-t border-border pt-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <CheckCircle2 className="size-4 mt-0.5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-400">Último passo</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Após o DNS propagar, cole a URL completa no campo acima e salve.
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <ArrowRight className="size-3 text-emerald-400 shrink-0" />
                  <code className="font-mono text-xs text-emerald-400/80">
                    https://propostas.suaempresa.com.br
                  </code>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
