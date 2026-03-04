import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { PostEditor } from '../_components/post-editor';

export const metadata = {
  title: 'Novo Post — Blog VertexHub',
};

export default async function NovoPostPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-4 mb-3">
          <Link
            href="/blog-admin"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-vibe-surface border border-vibe-primary/20 shadow-inner">
            <BookOpen className="size-6 text-vibe-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Novo Post</h1>
            <p className="text-base text-muted-foreground mt-1">
              Crie um post com suporte a geração de conteúdo e imagem via Gemini.
            </p>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent mt-6" />
      </div>

      <PostEditor />
    </div>
  );
}
