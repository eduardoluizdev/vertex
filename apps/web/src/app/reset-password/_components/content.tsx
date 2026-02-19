'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VertexHubLogo } from '@/components/vertexhub-logo';
import { AnimatedBackground } from '@/app/_components/animated-background';

type TokenStatus = 'checking' | 'valid' | 'invalid';
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Letra maiúscula', ok: /[A-Z]/.test(password) },
    { label: 'Letra minúscula', ok: /[a-z]/.test(password) },
    { label: 'Número', ok: /\d/.test(password) },
    { label: 'Caractere especial', ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.ok).length;
  const strength =
    score <= 1 ? 'Fraca' : score <= 3 ? 'Média' : score === 4 ? 'Boa' : 'Forte';
  const color =
    score <= 1
      ? 'bg-red-500'
      : score <= 3
        ? 'bg-amber-500'
        : score === 4
          ? 'bg-blue-500'
          : 'bg-emerald-500';

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Barra de progresso */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? color : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Força:{' '}
        <span
          className={
            score <= 1
              ? 'text-red-400'
              : score <= 3
                ? 'text-amber-400'
                : score === 4
                  ? 'text-blue-400'
                  : 'text-emerald-400'
          }
        >
          {strength}
        </span>
      </p>
    </div>
  );
}

export function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateToken = useCallback(async () => {
    if (!token) {
      setTokenStatus('invalid');
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/validate-reset-token?token=${token}`,
      );
      const data = await res.json();
      setTokenStatus(data.valid ? 'valid' : 'invalid');
    } catch {
      setTokenStatus('invalid');
    }
  }, [token]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setSubmitStatus('loading');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? 'Erro ao redefinir senha');
      }

      setSubmitStatus('success');
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Ocorreu um erro inesperado.',
      );
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <AnimatedBackground />

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
              <h1 className="text-3xl font-bold text-white">Nova Senha</h1>
              <p className="text-gray-400 mt-2 text-sm">
                Crie uma senha forte e segura para sua conta.
              </p>
            </div>
          </div>

          {/* Estado: Verificando token */}
          {tokenStatus === 'checking' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
              <p className="text-gray-400 text-sm">Verificando seu link...</p>
            </div>
          )}

          {/* Estado: Token inválido */}
          {tokenStatus === 'invalid' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">Link inválido ou expirado</p>
                <p className="text-sm text-gray-400 mt-1">
                  Este link de recuperação não é mais válido. Os links expiram em 1 hora e só podem ser usados uma vez.
                </p>
              </div>
              <Link href="/forgot-password" className="w-full mt-2">
                <Button className="w-full h-12 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0">
                  Solicitar novo link
                </Button>
              </Link>
            </div>
          )}

          {/* Estado: Sucesso */}
          {tokenStatus === 'valid' && submitStatus === 'success' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">Senha redefinida!</p>
                <p className="text-sm text-gray-400 mt-1">
                  Sua senha foi alterada com sucesso. Você já pode fazer login com sua nova senha.
                </p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="w-full h-12 mt-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0"
              >
                Ir para o login
              </Button>
            </div>
          )}

          {/* Estado: Formulário */}
          {tokenStatus === 'valid' && submitStatus !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Ícone de segurança */}
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                  <ShieldCheck className="w-6 h-6 text-violet-400" />
                </div>
              </div>

              {/* Mensagem de erro */}
              {submitStatus === 'error' && errorMessage && (
                <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Erro de validação (senhas não coincidem) */}
              {submitStatus === 'idle' && errorMessage && (
                <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Campo: Nova senha */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-300">
                  Nova senha
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={submitStatus === 'loading'}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <PasswordStrengthBar password={password} />
              </div>

              {/* Campo: Confirmar senha */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-300">
                  Confirmar nova senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={submitStatus === 'loading'}
                    className={`h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20 pr-12 ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500/50'
                        : confirmPassword && password === confirmPassword
                          ? 'border-emerald-500/50'
                          : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* Indicador de match em tempo real */}
                {confirmPassword && (
                  <p
                    className={`text-xs flex items-center gap-1 ${
                      password === confirmPassword
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle className="w-3 h-3" /> Senhas coincidem
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Senhas não coincidem
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Botão de submit */}
              <Button
                id="reset-password-submit"
                type="submit"
                disabled={submitStatus === 'loading'}
                className="h-12 w-full text-base font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0"
              >
                {submitStatus === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  'Salvar nova senha'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
