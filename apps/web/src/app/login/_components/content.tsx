'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { VertexLogo } from '@/components/vertex-logo';
import { AnimatedBackground } from '@/app/_components/animated-background';

export function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
              <VertexLogo className="w-16 h-16 text-violet-400 mx-auto" />
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
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
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
                href="#"
                className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              className="h-12 w-full text-base font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-400">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
