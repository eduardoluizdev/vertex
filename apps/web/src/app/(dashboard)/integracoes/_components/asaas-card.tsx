'use client';

import { useState, useTransition } from 'react';
import {
  CreditCard,
  Key,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Zap,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { updateAsaasIntegration, testAsaasConnection, removeIntegrationAction } from '../_actions/integrations-actions';

interface AsaasCardProps {
  initialApiKey: string;
  isConfigured: boolean;
  initialIsSandbox?: boolean;
  companyId?: string;
}

export function AsaasCard({
  initialApiKey,
  isConfigured,
  initialIsSandbox,
  companyId,
}: AsaasCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState(initialApiKey || '');
  const [configured, setConfigured] = useState(isConfigured);
  const [isSandbox, setIsSandbox] = useState(initialIsSandbox ?? false);
  
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string; } | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; } | null>(null);
  
  const [isSaving, startSave] = useTransition();
  const [isTesting, startTest] = useTransition();
  const [isRemoving, startRemove] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveResult(null);

    const formData = new FormData(e.currentTarget);
    // Checkbox desmarcado não é enviado pelo FormData — forçamos via estado React
    formData.set('asaasIsSandbox', isSandbox ? 'on' : 'off');
    startSave(async () => {
      const result = await updateAsaasIntegration(companyId, formData);
      setSaveResult(result);
      if (result.success && result.data?.asaas) {
        setApiKey(result.data.asaas.apiKey);
        setConfigured(result.data.asaas.isConfigured);
        setIsSandbox(result.data.asaas.isSandbox);
      }
    });
  }

  async function handleTest() {
    setTestResult(null);
    startTest(async () => {
      const result = await testAsaasConnection(companyId);
      setTestResult(result);
    });
  }

  async function handleRemove() {
    if (!confirm('Tem certeza que deseja remover esta integração?')) return;
    
    startRemove(async () => {
      const result = await removeIntegrationAction('asaas', companyId);
      if (result.success) {
        setApiKey('');
        setConfigured(false);
        setIsSandbox(false);
        setSaveResult(null);
        setTestResult(null);
      } else {
        setSaveResult({ success: false, message: result.message });
      }
    });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:border-blue-500/50 transition-colors group h-full">
          <div className="flex items-center gap-4 mb-3">
             <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
               <CreditCard className="size-5" />
             </div>
             <div className="flex-1">
               <h3 className="font-semibold text-foreground">Asaas API</h3>
               <p className="text-xs text-muted-foreground line-clamp-1">Pagamentos Pix</p>
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
              <SheetTitle className="text-xl">Asaas & Pagamentos</SheetTitle>
              <SheetDescription>Configure sua integração para gerar links de pagamento Pix em propostas.</SheetDescription>
            </div>
            <a href="https://asaas.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <ExternalLink className="size-4" />
            </a>
          </div>
        </SheetHeader>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
             <div className="p-5 bg-muted/10 border-b border-border/50 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Key className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Credenciais da API</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 tracking-tight">Configure sua chave de acesso (API Key) do Asaas.</p>
                </div>
             </div>
             
             <div className="p-6">
               <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <label htmlFor="asaasApiKey" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Key className="size-4 text-blue-400" />
                  Chave de API (Access Token)
                </label>
                <div className="relative">
                  <input
                    id="asaasApiKey"
                    name="asaasApiKey"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="$aact_xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full rounded-lg border border-input bg-input/30 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Você pode gerar essa chave no painel do Asaas em Configurações &gt; Integrações.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1 pb-2">
                <input
                  type="checkbox"
                  id="asaasIsSandbox"
                  name="asaasIsSandbox"
                  checked={isSandbox}
                  onChange={(e) => setIsSandbox(e.target.checked)}
                  className="size-4 rounded border-border bg-input text-blue-500 focus:ring-blue-500/20"
                />
                <label htmlFor="asaasIsSandbox" className="text-sm font-medium text-foreground cursor-pointer">
                  A chave acima é de Sandbox (Ambiente de Testes)
                </label>
              </div>

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
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-500/20 gap-2"
                >
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  Salvar Chave
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                {configured && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-2"
                  >
                    {isRemoving ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                    Remover Integração
                  </Button>
                )}
              </div>
              
              {saveResult && (
                <div className={`flex items-start gap-3 rounded-lg border p-3 w-fit text-sm mt-4 ${saveResult.success ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}>
                  {saveResult.success ? <CheckCircle2 className="size-4 mt-0.5 shrink-0" /> : <XCircle className="size-4 mt-0.5 shrink-0" />}
                  {saveResult.message}
                </div>
              )}
             </form>
             </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
