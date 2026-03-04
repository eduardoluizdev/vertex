import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getBlogPosts } from '@/actions/blog-actions';
import { PenSquare, Plus, BookOpen, Calendar, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogDeleteButton } from './_components/blog-delete-button';

export const metadata = {
  title: 'Blog — VertexHub',
};

export default async function BlogAdminPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-vibe-surface border border-vibe-primary/20 shadow-inner">
              <BookOpen className="size-6 text-vibe-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
              <p className="text-base text-muted-foreground mt-1">
                Gerencie os posts do blog com suporte a IA.
              </p>
            </div>
          </div>
          <Button asChild className="gap-2">
            <Link href="/blog-admin/novo">
              <Plus className="size-4" />
              Novo Post
            </Link>
          </Button>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent mt-6" />
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="size-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Nenhum post ainda</p>
          <p className="text-sm text-muted-foreground/60 mt-1 mb-6">
            Crie seu primeiro post com ajuda da IA Gemini.
          </p>
          <Button asChild>
            <Link href="/blog-admin/novo">
              <Plus className="size-4 mr-2" />
              Criar primeiro post
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
            >
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.headline}
                  className="size-16 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold truncate">{post.headline}</h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium ${
                          post.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {post.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild className="gap-1.5">
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="size-3.5" />
                        Ver
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="gap-1.5">
                      <Link href={`/blog-admin/${post.slug}/editar`}>
                        <PenSquare className="size-3.5" />
                        Editar
                      </Link>
                    </Button>
                    <BlogDeleteButton postId={post.id} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
