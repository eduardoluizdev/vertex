'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">V</span>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Bem-vindo de volta ao{' '}
              <span className="text-primary">Vertex</span>
            </h1>
            <p className="text-muted-foreground">
              Faça login com seu email e senha para acessar sua conta
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
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
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label
                  htmlFor="remember"
                  className="cursor-pointer text-sm font-normal"
                >
                  Manter conectado
                </Label>
              </div>
              <Link
                href="#"
                className="text-sm font-medium text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              className="h-11 w-full text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:bg-primary/5 lg:p-12">
        <div className="relative w-full max-w-lg">
          {/* Decorative card */}
          <div className="rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">V</span>
              </div>
              <span className="text-lg font-semibold">Vertex</span>
            </div>

            {/* Mock dashboard stats */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Total vendas</p>
                <p className="text-lg font-bold">$18.200</p>
                <span className="text-xs text-emerald-600">+10.2%</span>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Despesas</p>
                <p className="text-lg font-bold">$18.200</p>
                <span className="text-xs text-emerald-600">+5.7%</span>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Lucro</p>
                <p className="text-lg font-bold">$18.200</p>
                <span className="text-xs text-emerald-600">+8.3%</span>
              </div>
            </div>

            {/* Mock chart bars */}
            <div className="mb-4">
              <p className="mb-3 text-sm font-medium">Receita mensal</p>
              <div className="flex items-end gap-2">
                {[40, 65, 45, 80, 55, 90, 70, 60, 85, 50, 75, 95].map(
                  (h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${i === 11 ? 'bg-primary' : 'bg-primary/20'}`}
                      style={{ height: `${h}px` }}
                    />
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Floating decorative elements */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-2xl bg-primary/10" />
          <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-xl bg-primary/15" />
        </div>
      </div>
    </div>
  );
}
