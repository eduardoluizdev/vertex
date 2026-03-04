'use client';

import { useState, useTransition } from 'react';
import { Key, CheckCircle2, XCircle, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { updateGeminiIntegration } from '@/actions/blog-actions';

interface GeminiCardProps {
  initialApiKey: string;
  isConfigured: boolean;
}

export function GeminiCard({ initialApiKey, isConfigured }: GeminiCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState(initialApiKey || '');
  const [configured, setConfigured] = useState(isConfigured);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, startSave] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const formData = new FormData(e.currentTarget);
    startSave(async () => {
      const res = await updateGeminiIntegration(formData);
      setResult(res);
      if (res.success) setConfigured(true);
    });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:border-violet-500/50 transition-colors group h-full">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 group-hover:scale-110 transition-transform">
              <Sparkles className="size-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">IA — Gemini</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Geração de texto e imagem para o blog
              </p>
            </div>
          </div>
          <div>
            <div
              className={`text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 border ${
                configured
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}
            >
              <div
                className={`size-1.5 rounded-full ${configured ? 'bg-emerald-500' : 'bg-amber-500'} ${!configured && 'animate-pulse'}`}
              />
              {configured ? 'Conectado' : 'Pendente'}
            </div>
          </div>
        </div>
      </SheetTrigger>

      <SheetContent className="sm:max-w-[560px] w-full p-0 flex flex-col h-full sm:h-auto sm:max-h-[100dvh]">
        <SheetHeader className="px-6 py-6 border-b border-border/50 bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <Sparkles className="size-5" />
            </div>
            <div>
              <SheetTitle className="text-xl">Google Gemini</SheetTitle>
              <SheetDescription>
                Configure a API Key para gerar conteúdo e imagens de capa no blog.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-5 bg-muted/10 border-b border-border/50 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                <Key className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold">API Key</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Obtenha em{' '}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    aistudio.google.com/apikey
                  </a>
                </p>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="geminiApiKey" className="flex items-center gap-2 text-sm font-medium">
                    <Key className="size-4 text-violet-400" />
                    API Key do Gemini
                  </label>
                  <div className="relative">
                    <input
                      id="geminiApiKey"
                      name="geminiApiKey"
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full rounded-lg border border-input bg-input/30 px-4 py-2.5 pr-10 text-sm placeholder:text-muted-foreground/50 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 font-mono"
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

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-violet-500/20 gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Salvar API Key
                  </Button>
                </div>

                {result && (
                  <div
                    className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
                      result.success
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : 'border-red-500/20 bg-red-500/10 text-red-400'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="size-4 mt-0.5 shrink-0" />
                    )}
                    {result.message}
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-violet-400">O que o Gemini faz no VertexHub:</p>
            <ul className="space-y-1 mt-2 text-xs list-disc list-inside">
              <li>Gera o conteúdo completo do post a partir da headline</li>
              <li>Cria imagens de capa profissionais para os posts</li>
              <li>Tudo processado com segurança no servidor</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
