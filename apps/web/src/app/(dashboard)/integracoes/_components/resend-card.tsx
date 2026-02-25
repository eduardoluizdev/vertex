'use client';

import { useState, useTransition } from 'react';
import {
  Mail,
  Key,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Zap,
  ExternalLink,
  Clock,
  Copy,
  Check,
  Trash2,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { updateResendIntegration, testResendConnection } from '../_actions/integrations-actions';
import {
  createDomain,
  verifyDomain,
  deleteDomain,
  getDomainStatus,
  type DnsRecord,
} from '../_actions/domain-actions';

interface ResendCardProps {
  initialApiKey: string;
  initialFrontendUrl: string;
  initialFromEmail: string;
  isConfigured: boolean;
  companyId?: string;
  initialDomain?: string | null;
  initialStatus?: string;
  initialRecords?: DnsRecord[];
}

function DomainStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    verified: {
      label: 'Verificado',
      className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      icon: <CheckCircle2 className="size-3.5" />,
    },
    pending: {
      label: 'Pendente',
      className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      icon: <Clock className="size-3.5" />,
    },
    failed: {
      label: 'Falhou',
      className: 'bg-red-500/10 text-red-500 border-red-500/20',
      icon: <XCircle className="size-3.5" />,
    },
    not_started: {
      label: 'Não configurado',
      className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      icon: <AlertCircle className="size-3.5" />,
    },
  };
  const s = map[status] ?? map.not_started;
  return (
    <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border ${s.className}`}>
      {s.icon}
      {s.label}
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="ml-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
      title="Copiar"
    >
      {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
    </button>
  );
}

function RecordsTable({ records }: { records: DnsRecord[] }) {
  if (!records || records.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
            <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome / Host</th>
            <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
              <td className="py-3 px-4">
                <span className="inline-flex items-center rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-xs font-mono font-semibold text-violet-400">
                  {r.type}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <code className="font-mono text-xs text-foreground/80 break-all">{r.name}</code>
                  <CopyButton value={r.name} />
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center max-w-[200px]">
                  <code className="font-mono text-xs text-foreground/80 truncate block w-full">{r.value}</code>
                  <CopyButton value={r.value} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ResendCard({
  initialApiKey,
  initialFrontendUrl,
  initialFromEmail,
  isConfigured,
  companyId,
  initialDomain,
  initialStatus,
  initialRecords,
}: ResendCardProps) {
  // Resend State
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState(initialApiKey || '');
  const [frontendUrl, setFrontendUrl] = useState(initialFrontendUrl);
  const [fromEmail, setFromEmail] = useState(initialFromEmail);
  const [configured, setConfigured] = useState(isConfigured);
  
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string; } | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; } | null>(null);
  
  const [isSaving, startSave] = useTransition();
  const [isTesting, startTest] = useTransition();

  // Domain State
  const [domain, setDomain] = useState(initialDomain ?? '');
  const [inputDomain, setInputDomain] = useState('');
  const [domainStatus, setDomainStatus] = useState(initialStatus ?? 'not_started');
  const [records, setRecords] = useState<DnsRecord[]>(initialRecords ?? []);
  const [showRecords, setShowRecords] = useState(domainStatus === 'pending');
  const [domainFeedback, setDomainFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [isCreatingDomain, startCreateDomain] = useTransition();
  const [isVerifyingDomain, startVerifyDomain] = useTransition();
  const [isDeletingDomain, startDeleteDomain] = useTransition();
  const [isRefreshingDomain, startRefreshDomain] = useTransition();

  const hasDomain = !!domain && domainStatus !== 'not_started';

  // Handlers for Resend
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveResult(null);

    const formData = new FormData(e.currentTarget);
    startSave(async () => {
      const result = await updateResendIntegration(companyId, formData);
      setSaveResult(result);
      if (result.success && result.data) {
        setApiKey(result.data.resend.apiKey);
        setFrontendUrl(result.data.resend.frontendUrl);
        setFromEmail(result.data.resend.fromEmail);
        setConfigured(result.data.resend.isConfigured);
      }
    });
  }

  async function handleTest() {
    setTestResult(null);
    startTest(async () => {
      const result = await testResendConnection(companyId);
      setTestResult(result);
    });
  }

  // Handlers for Domain
  function handleCreateDomainUser(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId || !inputDomain.trim()) return;
    setDomainFeedback(null);
    startCreateDomain(async () => {
      const result = await createDomain(companyId, inputDomain.trim());
      setDomainFeedback(result);
      if (result.success && result.data) {
        setDomain(result.data.domain ?? '');
        setDomainStatus(result.data.status);
        setRecords(result.data.records ?? []);
        setShowRecords(true);
        setInputDomain('');
      }
    });
  }

  function handleVerifyDomainUser() {
    if (!companyId) return;
    setDomainFeedback(null);
    startVerifyDomain(async () => {
      const result = await verifyDomain(companyId);
      setDomainFeedback(result);
      if (result.success) {
        startRefreshDomain(async () => {
          const fresh = await getDomainStatus(companyId);
          setDomainStatus(fresh.status);
          setRecords(fresh.records ?? []);
        });
      }
    });
  }

  function handleDeleteDomainUser() {
    if (!companyId) return;
    setDomainFeedback(null);
    startDeleteDomain(async () => {
      const result = await deleteDomain(companyId);
      setDomainFeedback(result);
      if (result.success) {
        setDomain('');
        setDomainStatus('not_started');
        setRecords([]);
        setShowRecords(false);
      }
    });
  }

  function handleRefreshStatusDomain() {
    if (!companyId) return;
    setDomainFeedback(null);
    startRefreshDomain(async () => {
      const fresh = await getDomainStatus(companyId);
      setDomainStatus(fresh.status);
      setRecords(fresh.records ?? []);
      setDomainFeedback({ success: true, message: 'Status atualizado.' });
    });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:border-violet-500/50 transition-colors group h-full">
          <div className="flex items-center gap-4 mb-3">
             <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 group-hover:scale-110 transition-transform">
               <Mail className="size-5" />
             </div>
             <div className="flex-1">
               <h3 className="font-semibold text-foreground">Resend API</h3>
               <p className="text-xs text-muted-foreground line-clamp-1">E-mail Transacional</p>
             </div>
          </div>
          <div>
            <div className={`text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 border ${configured ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
              <div className={`size-1.5 rounded-full ${configured ? 'bg-emerald-500' : 'bg-amber-500'} ${!configured && 'animate-pulse'}`} />
              {configured ? 'Conectado' : 'Pendente'}
            </div>
          </div>
        </div>
      </SheetTrigger>

      <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col h-full sm:h-auto sm:max-h-[100dvh]">
        <SheetHeader className="px-6 py-6 border-b border-border/50 bg-muted/10 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">Resend & E-mail</SheetTitle>
              <SheetDescription>Assinatura de envios e chaves de API.</SheetDescription>
            </div>
            <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <ExternalLink className="size-4" />
            </a>
          </div>
        </SheetHeader>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6">

        {/* Section 1: Credenciais */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
           <div className="p-5 bg-muted/10 border-b border-border/50 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                <Key className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Credenciais da API</h3>
                <p className="text-sm text-muted-foreground mt-0.5 tracking-tight">Configure sua chave de acesso do Resend.</p>
              </div>
           </div>
           
           <div className="p-6">
             <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="space-y-2">
              <label htmlFor="resendApiKey" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Key className="size-4 text-violet-400" />
                Chave de API (RESEND_API_KEY)
              </label>
              <div className="relative">
                <input
                  id="resendApiKey"
                  name="resendApiKey"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full rounded-lg border border-input bg-input/30 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Actions for API Key form */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={isTesting || !configured}
                  className="gap-2"
                >
                  {isTesting ? <Loader2 className="size-3.5 animate-spin" /> : <Zap className="size-3.5" />}
                  Testar chave
                </Button>
                {testResult && (
                  <div className={`flex items-center gap-1.5 text-[11px] font-medium ${testResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {testResult.success ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                    {testResult.message}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-violet-500/20 gap-2"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Salvar Chave
              </Button>
            </div>
           </form>
           </div>
        </div>

        {/* Section 2: Domain (Only if companyId is present, meant for companies) */}
        {companyId && (
          <div className={`rounded-2xl border border-border bg-card overflow-hidden transition-all ${!configured ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
             <div className="p-5 bg-muted/10 border-b border-border/50 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Globe className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Domínio Remetente</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 tracking-tight">{configured ? 'Cadastre e verifique um domínio no Resend para fazer envios autorizados.' : 'Configure e salve a Chave de API primeiro para configurar o domínio.'}</p>
                </div>
             </div>
             
             <div className="p-6">
               <div className="max-w-3xl space-y-4">
              {!hasDomain ? (
                <form onSubmit={handleCreateDomainUser} className="flex gap-3 max-w-md items-end">
                  <div className="flex-1 space-y-2">
                    <label htmlFor="domainInput" className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Globe className="size-4 text-blue-400" />
                      Nome do domínio
                    </label>
                    <input
                      id="domainInput"
                      type="text"
                      value={inputDomain}
                      onChange={(e) => setInputDomain(e.target.value)}
                      placeholder="minhaempresa.com.br"
                      className="w-full rounded-lg border border-input bg-input/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 font-mono"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isCreatingDomain || !inputDomain.trim()}
                    className="gap-2 shrink-0 h-10 border-blue-500/20 hover:bg-blue-500/10 text-blue-500"
                  >
                    {isCreatingDomain ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
                    Cadastrar
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-muted/30 border border-border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className={`size-5 ${domainStatus === 'verified' ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground font-mono">{domain}</p>
                          <DomainStatusBadge status={domainStatus} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRefreshStatusDomain}
                        disabled={isRefreshingDomain}
                        className="text-xs gap-1.5"
                      >
                        {isRefreshingDomain ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                        Verificar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteDomainUser}
                        disabled={isDeletingDomain}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
                      >
                        {isDeletingDomain ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                        Remover
                      </Button>
                    </div>
                  </div>

                  {records.length > 0 && (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setShowRecords((v) => !v)}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showRecords ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        {showRecords ? 'Ocultar records DNS' : 'Ver records DNS para verificação'}
                      </button>
                      {showRecords && (
                        <div className="space-y-3">
                          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-500">
                            Configure estes registros no painel de controle do seu DNS (Cloudflare, GoDaddy, etc) e em seguida atualize o status.
                          </div>
                          <RecordsTable records={records} />
                          {(domainStatus === 'pending' || domainStatus === 'failed') && (
                            <Button
                              type="button"
                              onClick={handleVerifyDomainUser}
                              disabled={isVerifyingDomain}
                              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 gap-2"
                            >
                              {isVerifyingDomain ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                              Validar DNS Agora
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {domainFeedback && (
                <div className={`flex items-start gap-3 rounded-lg border p-3 w-fit text-sm ${domainFeedback.success ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}>
                  {domainFeedback.success ? <CheckCircle2 className="size-4 mt-0.5 shrink-0" /> : <XCircle className="size-4 mt-0.5 shrink-0" />}
                  {domainFeedback.message}
                </div>
              )}
            </div>
             </div>
          </div>
        )}

        {/* Section 3: Remetente Principal */}
        <div className={`rounded-2xl border border-border bg-card overflow-hidden transition-all ${!configured ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
           <div className="p-5 bg-muted/10 border-b border-border/50 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Mail className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Endereço do Remetente</h3>
                <p className="text-sm text-muted-foreground mt-0.5 tracking-tight">Email usado no campo "De:" para os envios.</p>
              </div>
           </div>
           
           <div className="p-6">
             <form
            onSubmit={(e) => {
              e.preventDefault();
              // Create a dummy form data to submit just this section or reuse the state
              const formData = new FormData();
              formData.set('resendApiKey', apiKey);
              formData.set('frontendUrl', frontendUrl);
              formData.set('fromEmail', fromEmail);
              
              startSave(async () => {
                const result = await updateResendIntegration(companyId, formData);
                if (result.success && result.data) {
                  setSaveResult({ success: true, message: 'Remetente salvo com sucesso!' });
                } else {
                  setSaveResult(result);
                }
              });
            }}
            className="space-y-4 max-w-2xl"
          >
            <div className="space-y-2">
              <label htmlFor="fromEmail" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Mail className="size-4 text-emerald-400" />
                Remetente Principal (From Email)
              </label>
              <input
                id="fromEmail"
                name="fromEmail"
                type="text"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="Nome da Empresa <contato@seudominio.com.br>"
                className="w-full rounded-lg border border-input bg-input/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
              <p className="text-xs text-muted-foreground">
                Dica: Utilize o formato <code>Empresa &lt;email@dominio&gt;</code>. {!companyId && "O domínio deve estar verificado no painel principal do Resend."}
                {companyId && " O domínio deve estar verificado na etapa acima."}
              </p>
            </div>
            
            <Button
              type="submit"
              disabled={isSaving}
              variant="secondary"
              className="gap-2 shrink-0 border border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Salvar Endereço
            </Button>
             </form>
           </div>
        </div>
        
        </div>
      </SheetContent>
    </Sheet>
  );
}

