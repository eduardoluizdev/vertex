'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Mail, Github, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setMessage({ type: 'error', text: error });
    }

    if (token) {
      handleTokenUpdate(token);
    }
  }, [searchParams]);

  const handleTokenUpdate = async (token: string) => {
    setIsLoading(true);
    try {
      // Re-autentica com o novo token para atualizar a sessão
      const result = await signIn('github-token', {
        token,
        redirect: false,
      });

      if (result?.error) {
        setMessage({ type: 'error', text: 'Erro ao atualizar sessão após vínculo.' });
      } else {
        await update(); // Atualiza os dados do useSession() localmente
        setMessage({ type: 'success', text: 'Conta GitHub vinculada com sucesso!' });
        router.refresh(); 
        router.replace('/perfil');
      }
    } catch {
      setMessage({ type: 'error', text: 'Ocorreu um erro ao vincular a conta.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkGithub = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.vertexhub.dev';
    const userId = session?.user?.id;
    if (!userId) return;

    // Redireciona para o backend passando o state de vínculo
    window.location.href = `${apiUrl}/v1/auth/github?state=link:${userId}`;
  };

  if (!session) return null;

  const { name, email, image, githubId } = session.user as any;
  const isGithubLinked = !!githubId;

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-vibe-surface border border-vibe-primary/20 shadow-inner">
            <User className="size-6 text-vibe-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Meu Perfil
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Gerencie suas informações pessoais e conexões.
            </p>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent mt-6" />
      </div>

      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="size-4" /> : <ShieldCheck className="size-4" />}
            {message.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 flex flex-col items-center text-center space-y-4">
            <Avatar className="size-24 border-2 border-vibe-primary/20">
              <AvatarImage src={image} alt={name || 'User'} />
              <AvatarFallback className="text-2xl">{getInitials(name || 'U')}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground">{name}</h2>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="p-6 border-b border-border/50 bg-muted/5">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="size-5 text-vibe-primary" />
                Segurança & Conexões
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Account Info */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-vibe-primary/10 flex items-center justify-center text-vibe-primary">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Email de Acesso</p>
                    <p className="text-xs text-muted-foreground">{email}</p>
                  </div>
                </div>
                <div className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                  Verificado
                </div>
              </div>

              {/* GitHub Connection */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-vibe-primary/10 flex items-center justify-center text-vibe-primary">
                    <Github className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Conexão com GitHub</p>
                    <p className="text-xs text-muted-foreground">
                      {isGithubLinked 
                        ? 'Sua conta está vinculada ao GitHub' 
                        : 'Vincule seu GitHub para entrar com um clique'}
                    </p>
                  </div>
                </div>
                
                {isGithubLinked ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="size-3.5" />
                    Vinculado ({githubId})
                  </div>
                ) : (
                  <Button
                    onClick={handleLinkGithub}
                    disabled={isLoading}
                    variant="outline"
                    className="h-9 gap-2 border-vibe-primary/20 hover:bg-vibe-primary/10 hover:text-vibe-primary"
                  >
                    {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Github className="size-4" />}
                    Vincular GitHub
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
