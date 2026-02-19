'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VertexHubLogo } from '@/components/vertexhub-logo';
import { AnimatedBackground } from '@/app/_components/animated-background';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? 'Erro ao enviar email');
      }

      setStatus('success');
      setMessage(data.message);
    } catch (err) {
      setStatus('error');
      setMessage(
        err instanceof Error ? err.message : 'Ocorreu um erro inesperado.',
      );
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <AnimatedBackground />

      {/* Back to login link */}
      <Link
        href="/login"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao login
      </Link>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="glass-strong rounded-3xl p-8 space-y-6">
          {/* Logo e Header */}
          <div className="text-center space-y-4">
            <div className="inline-block">
              <VertexHubLogo className="w-16 h-16 text-violet-400 mx-auto" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Recuperar Senha</h1>
              <p className="text-gray-400 mt-2 text-sm">
                Digite seu email e enviaremos as instruções para criar uma nova senha.
              </p>
            </div>
          </div>

          {/* Ícone de status */}
          {status === 'success' ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">Email enviado!</p>
                <p className="text-sm text-gray-400 mt-1">{message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Verifique também sua caixa de spam.
                </p>
              </div>
              <Link href="/login" className="mt-2 w-full">
                <Button
                  className="w-full h-12 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0"
                >
                  Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Ícone do email */}
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                  <Mail className="w-6 h-6 text-violet-400" />
                </div>
              </div>

              {/* Mensagem de erro */}
              {status === 'error' && (
                <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {message}
                </div>
              )}

              {/* Campo de email */}
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-gray-300">
                  Email cadastrado
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === 'loading'}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
                />
              </div>

              {/* Botão de envio */}
              <Button
                id="forgot-password-submit"
                type="submit"
                disabled={status === 'loading'}
                className="h-12 w-full text-base font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  'Enviar instruções'
                )}
              </Button>

              {/* Link de volta */}
              <p className="text-center text-sm text-gray-400">
                Lembrou a senha?{' '}
                <Link
                  href="/login"
                  className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Fazer login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
