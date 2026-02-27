'use client';

import { useState, useTransition } from 'react';
import {
  Github,
  Key,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { updateGithubOauthIntegration, removeIntegrationAction } from '../_actions/integrations-actions';

interface GithubOauthCardProps {
  initialClientId: string;
  initialClientSecret: string;
  isConfigured: boolean;
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

export function GithubOauthCard({
  initialClientId,
  initialClientSecret,
  isConfigured,
}: GithubOauthCardProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [clientId, setClientId] = useState(initialClientId || '');
  const [clientSecret, setClientSecret] = useState(initialClientSecret || '');
  const [configured, setConfigured] = useState(isConfigured);
  
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string; } | null>(null);
  
  const [isSaving, startSave] = useTransition();
  const [isRemoving, startRemove] = useTransition();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.vertexhub.dev';
  const callbackUrl = `${apiUrl}/v1/auth/github/callback`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveResult(null);

    const formData = new FormData(e.currentTarget);
    startSave(async () => {
      const result = await updateGithubOauthIntegration(formData);
      setSaveResult(result);
      if (result.success && result.data?.githubOauth) {
        setClientId(result.data.githubOauth.clientId);
        setClientSecret(result.data.githubOauth.clientSecret);
        setConfigured(result.data.githubOauth.isConfigured);
      }
    });
  }

  async function handleRemove() {
    if (!confirm('Tem certeza que deseja remover esta integração?')) return;
    
    startRemove(async () => {
      const result = await removeIntegrationAction('githubOauth');
      if (result.success) {
        setClientId('');
        setClientSecret('');
        setConfigured(false);
        setSaveResult(null);
      } else {
        setSaveResult({ success: false, message: result.message });
      }
    });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:border-vibe-primary/50 transition-colors group h-full">
          <div className="flex items-center gap-4 mb-3">
             <div className="flex size-10 items-center justify-center rounded-lg bg-vibe-primary/10 text-vibe-primary group-hover:scale-110 transition-transform">
               <Github className="size-5" />
             </div>
             <div className="flex-1">
               <h3 className="font-semibold text-foreground">GitHub Login Social</h3>
               <p className="text-xs text-muted-foreground line-clamp-1">Login rápido via OAuth</p>
             </div>
          </div>
          <div>
            <div className={`text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 border ${configured ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
              <div className={`size-1.5 rounded-full ${configured ? 'bg-emerald-500' : 'bg-amber-500'} ${!configured && 'animate-pulse'}`} />
              {configured ? 'Configurado' : 'Pendente'}
            </div>
          </div>
        </div>
      </SheetTrigger>

      <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col h-full sm:h-auto sm:max-h-[100dvh]">
        <SheetHeader className="px-6 py-6 border-b border-border/50 bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            <Github className="size-6 text-foreground" />
            <div>
              <SheetTitle className="text-xl">GitHub OAuth</SheetTitle>
              <SheetDescription>Configure o login social via GitHub para seus usuários.</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Instruções */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-5 bg-muted/10 border-b border-border/50 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-vibe-primary/10 text-vibe-primary">
                <ShieldCheck className="size-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Configuração no GitHub</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Para habilitar o login social, crie uma <strong>OAuth App</strong> no GitHub em 
                <em> Settings &gt; Developer settings &gt; OAuth Apps</em>.
              </p>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Authorization callback URL
                </label>
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2.5">
                  <code className="text-xs font-mono text-vibe-primary break-all">{callbackUrl}</code>
                  <CopyButton value={callbackUrl} />
                </div>
              </div>
            </div>
          </div>

          {/* Credenciais */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-5 bg-muted/10 border-b border-border/50 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-vibe-primary/10 text-vibe-primary">
                <Key className="size-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Credenciais</h3>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="githubClientId" className="text-sm font-medium text-foreground">
                    Client ID
                  </label>
                  <input
                    id="githubClientId"
                    name="githubClientId"
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="xxxxxxxxxxxxxxxxxxxx"
                    className="w-full rounded-lg border border-input bg-input/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-vibe-primary/50 focus:ring-2 focus:ring-vibe-primary/20 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="githubClientSecret" className="text-sm font-medium text-foreground">
                    Client Secret
                  </label>
                  <div className="relative">
                    <input
                      id="githubClientSecret"
                      name="githubClientSecret"
                      type={showSecret ? 'text' : 'password'}
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full rounded-lg border border-input bg-input/30 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-vibe-primary/50 focus:ring-2 focus:ring-vibe-primary/20 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {saveResult && (
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${saveResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                      {saveResult.success ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                      {saveResult.message}
                    </div>
                  )}
                  <div />
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-vibe-primary hover:bg-vibe-primary/90 text-vibe-bg border-0 gap-2"
                  >
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                    Salvar Credenciais
                  </Button>
                </div>
              </form>

              {configured && (
                <div className="mt-8 pt-6 border-t border-border/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-2"
                  >
                    {isRemoving ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                    Remover Login via GitHub
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
