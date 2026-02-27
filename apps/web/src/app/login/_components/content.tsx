'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { VertexHubLogo } from '@/components/vertexhub-logo';
import { AnimatedBackground } from '@/app/_components/animated-background';

function LoginContentInternal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const urlError = searchParams.get('error');

    if (urlError) {
      setError(urlError);
    }

    if (token) {
      handleGithubTokenLogin(token);
    }
  }, [searchParams]);

  async function handleGithubTokenLogin(token: string) {
    setIsLoading(true);
    try {
      const result = await signIn('github-token', {
        token,
        redirect: false,
      });

      if (result?.error) {
        setError('Erro ao autenticar com o GitHub');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Ocorreu um erro no login social');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha inválidos');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Ocorreu um erro inesperado');
    } finally {
      setIsLoading(false);
    }
  }

  const handleGithubClick = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    window.location.href = `${apiUrl}/v1/auth/github`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <AnimatedBackground />
      
      {/* Back to home link */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para home
      </Link>
      
      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="glass-strong rounded-3xl p-8 space-y-6">
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            <div className="inline-block">
              <VertexHubLogo className="w-16 h-16 text-vibe-primary mx-auto" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Bem-vindo de volta
              </h1>
              <p className="text-gray-400 mt-2">
                Faça login para acessar sua conta
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-vibe-primary focus:ring-vibe-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-vibe-primary focus:ring-vibe-primary/20 pr-12"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" className="border-white/20" />
                <Label
                  htmlFor="remember"
                  className="cursor-pointer text-sm font-normal text-gray-400"
                >
                  Manter conectado
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-vibe-primary hover:text-vibe-primary/80 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              className="h-12 w-full text-base font-semibold bg-vibe-primary hover:bg-vibe-primary/90 text-vibe-bg border-0"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Social Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-vibe-bg px-2 text-gray-500">Ou continue com</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
            onClick={handleGithubClick}
            disabled={isLoading}
          >
            <Github className="mr-2 h-5 w-5" />
            GitHub
          </Button>


          {/* Register Link */}
          <p className="text-center text-sm text-gray-400">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-medium text-vibe-primary hover:text-vibe-primary/80 transition-colors"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoginContent() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><AnimatedBackground /> <div className="text-white animate-pulse">Carregando...</div></div>}>
      <LoginContentInternal />
    </Suspense>
  )
}
