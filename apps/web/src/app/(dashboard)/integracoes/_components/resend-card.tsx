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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateResendIntegration, testResendConnection } from '../_actions/integrations-actions';

interface ResendCardProps {
  initialApiKey: string;
  initialFrontendUrl: string;
  initialFromEmail: string;
  isConfigured: boolean;
  companyId?: string;
}

export function ResendCard({
  initialApiKey,
  initialFrontendUrl,
  initialFromEmail,
  isConfigured,
  companyId,
}: ResendCardProps) {
  const [showKey, setShowKey] = useState(false);
  // Initialize with the full key (which comes from backend now)
  const [apiKey, setApiKey] = useState(initialApiKey || '');
  const [frontendUrl, setFrontendUrl] = useState(initialFrontendUrl);
  const [fromEmail, setFromEmail] = useState(initialFromEmail);
  const [configured, setConfigured] = useState(isConfigured);
  
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const [isSaving, startSave] = useTransition();
  const [isTesting, startTest] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveResult(null);

    const formData = new FormData(e.currentTarget);
    startSave(async () => {
      const result = await updateResendIntegration(companyId, formData);
      setSaveResult(result);
      if (result.success && result.data) {
        // Update local state with the returned full data
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

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md">
      {/* Card Header */}
      <div className="relative overflow-hidden px-6 py-5 border-b border-border bg-gradient-to-r from-violet-500/5 via-transparent to-blue-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Resend Logo/Icon */}
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-500/20">
              <Mail className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">Resend</h2>
                <a
                  href="https://resend.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                Serviço de envio de emails transacionais
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border ${
              configured
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}
          >
            <div
              className={`size-1.5 rounded-full ${
                configured ? 'bg-emerald-500' : 'bg-amber-500'
              } animate-pulse`}
            />
            {configured ? 'Configurado' : 'Não configurado'}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* RESEND_API_KEY field */}
        <div className="space-y-2">
          <label
            htmlFor="resendApiKey"
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <Key className="size-4 text-violet-400" />
            RESEND_API_KEY
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

        {/* FRONTEND_URL field */}
        <div className="space-y-2">
          <label
            htmlFor="frontendUrl"
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <Globe className="size-4 text-blue-400" />
            FRONTEND_URL
          </label>
          <input
            id="frontendUrl"
            name="frontendUrl"
            type="url"
            value={frontendUrl}
            onChange={(e) => setFrontendUrl(e.target.value)}
            placeholder="https://app.vertexhub.dev"
            className="w-full rounded-lg border border-input bg-input/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* FROM_EMAIL field */}
        <div className="space-y-2">
          <label
            htmlFor="fromEmail"
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <Mail className="size-4 text-emerald-400" />
            Remetente (From Email)
          </label>
          <input
            id="fromEmail"
            name="fromEmail"
            type="text"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="VertexHub <no-reply@vertexhub.dev>"
            className="w-full rounded-lg border border-input bg-input/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
          />
          <p className="text-xs text-muted-foreground">
            O domínio deve estar verificado no painel do Resend.
          </p>
        </div>

        {/* Save feedback */}
        {saveResult && (
          <div
            className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
              saveResult.success
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                : 'border-red-500/20 bg-red-500/10 text-red-400'
            }`}
          >
            {saveResult.success ? (
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="size-4 mt-0.5 shrink-0" />
            )}
            {saveResult.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Test connection */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={isTesting || !configured}
              className="gap-2"
            >
              {isTesting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Zap className="size-3.5" />
              )}
              Testar conexão
            </Button>

            {testResult && (
              <div
                className={`flex items-center gap-1.5 text-xs font-medium ${
                  testResult.success ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <XCircle className="size-3.5" />
                )}
                {testResult.message}
              </div>
            )}
          </div>

          {/* Save button */}
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-violet-500/20 gap-2"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Salvar configurações
          </Button>
        </div>
      </form>

      {/* Info footer */}
      <div className="px-6 py-4 border-t border-border bg-muted/20">
        <p className="text-xs text-muted-foreground">
          💡 As alterações entram em vigor imediatamente. Para persistir após reiniciar o servidor,
          atualize o arquivo{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">.env</code> da API.
        </p>
      </div>
    </div>
  );
}
