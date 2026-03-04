import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { VertexHubLogo } from '@/components/vertexhub-logo';

const API_URL = process.env.API_URL || 'https://api.vertexhub.dev';

interface BlogPost {
  id: string;
  headline: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  author: { name: string };
}

async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/v1/blog`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const posts: BlogPost[] = await res.json();
    return (posts as any[]).filter((p) => p.status === 'PUBLISHED');
  } catch {
    return [];
  }
}

export const metadata = {
  title: 'Blog — VertexHub',
  description: 'Artigos sobre automação, tecnologia e gestão de negócios.',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-300 antialiased">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white hover:opacity-80 transition-opacity">
            <VertexHubLogo />
          </Link>
          <nav className="flex items-center gap-4 text-xs text-neutral-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#FFB300] px-4 py-1.5 text-xs font-bold text-black hover:brightness-110 transition-all"
            >
              Criar Conta
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-14">
        {/* Hero do blog */}
        <div className="relative overflow-hidden border-b border-white/5">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.12),transparent)]" />
            <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          </div>
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-[#FFB300] mb-3">VertexHub</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">Blog</h1>
            <p className="mt-4 text-base text-neutral-400 max-w-md mx-auto">
              Automação, tecnologia e crescimento de negócios para agências e devs.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
          {posts.length === 0 ? (
            <div className="text-center py-32 text-neutral-500">
              <p className="text-lg">Nenhum artigo publicado ainda.</p>
              <p className="text-sm mt-2">Em breve!</p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Post em destaque */}
              {featured && (
                <Link href={`/blog/${featured.slug}`} className="group block">
                  <article className="grid md:grid-cols-2 gap-0 rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 hover:bg-white/[0.035] transition-all">
                    {featured.coverImage ? (
                      <div className="overflow-hidden aspect-video md:aspect-auto">
                        <img
                          src={featured.coverImage}
                          alt={featured.headline}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video md:aspect-auto bg-white/5 flex items-center justify-center">
                        <span className="text-5xl text-white/10">✦</span>
                      </div>
                    )}
                    <div className="flex flex-col justify-center p-8 lg:p-10 gap-4">
                      <span className="inline-flex w-fit text-[10px] font-bold uppercase tracking-widest text-[#FFB300] border border-[#FFB300]/30 bg-[#FFB300]/10 px-2.5 py-1 rounded-full">
                        Em destaque
                      </span>
                      <h2 className="text-2xl lg:text-3xl font-bold text-white leading-snug group-hover:text-[#FFB300] transition-colors">
                        {featured.headline}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3">{featured.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-neutral-500 mt-2">
                        <span>{featured.author.name}</span>
                        {featured.publishedAt && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              {formatDate(featured.publishedAt)}
                            </span>
                          </>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FFB300] mt-2 group-hover:gap-3 transition-all">
                        Ler artigo <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </article>
                </Link>
              )}

              {/* Grid dos demais */}
              {rest.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 hover:bg-white/[0.04] transition-all">
                      {post.coverImage ? (
                        <div className="overflow-hidden aspect-video">
                          <img
                            src={post.coverImage}
                            alt={post.headline}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-white/5 flex items-center justify-center">
                          <span className="text-3xl text-white/10">✦</span>
                        </div>
                      )}
                      <div className="flex flex-col flex-1 p-5 gap-3">
                        <h2 className="text-sm font-bold text-white leading-snug group-hover:text-[#FFB300] transition-colors line-clamp-2">
                          {post.headline}
                        </h2>
                        {post.excerpt && (
                          <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">{post.excerpt}</p>
                        )}
                        <div className="mt-auto pt-3 flex items-center justify-between text-xs text-neutral-500 border-t border-white/5">
                          <span>{post.author.name}</span>
                          {post.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              {new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer simples */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-neutral-600">
        © {new Date().getFullYear()} VertexHub — Todos os direitos reservados.
      </footer>
    </div>
  );
}
