import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { marked } from 'marked';
import { ViewTracker } from './_components/view-tracker';

const API_URL = process.env.API_URL || 'https://api.vertexhub.dev';

interface BlogPost {
  id: string;
  headline: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  author: { name: string };
  viewCount: number;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/v1/blog/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: 'Post não encontrado — VertexHub' };

  const excerpt = post.excerpt ?? post.content.slice(0, 160);

  return {
    title: `${post.headline} — Blog VertexHub`,
    description: excerpt,
    openGraph: {
      title: post.headline,
      description: excerpt,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      authors: [post.author.name],
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.headline,
      description: excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

function renderMarkdown(content: string): string {
  const renderer = new marked.Renderer();
  renderer.link = ({ href, title, text }) =>
    `<a href="${href}" title="${title ?? ''}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  marked.setOptions({ renderer });
  return marked.parse(content) as string;
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post || post.status !== 'PUBLISHED') notFound();

  const htmlContent = renderMarkdown(post.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.headline,
    description: post.excerpt ?? '',
    image: post.coverImage ?? '',
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.publishedAt ?? post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'VertexHub',
    },
  };

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero com capa */}
      {post.coverImage ? (
        <div className="relative w-full h-[420px] md:h-[520px] overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.headline}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto px-4 pb-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="size-4" />
              Voltar ao Blog
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight text-white mb-4">
              {post.headline}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <User className="size-4" />
                {post.author.name}
              </span>
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
              <ViewTracker postId={post.id} initialViews={post.viewCount ?? 0} />
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-0">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            Voltar ao Blog
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            {post.headline}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-10">
            <span className="flex items-center gap-1.5">
              <User className="size-4" />
              {post.author.name}
            </span>
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
            <ViewTracker postId={post.id} initialViews={post.viewCount ?? 0} />
          </div>
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 py-12">
        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary pl-4 mb-10 italic">
            {post.excerpt}
          </p>
        )}

        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-20
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
            prose-h3:text-xl prose-h3:mt-8
            prose-p:leading-[1.85] prose-p:text-foreground/85
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
            prose-strong:text-foreground
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:text-sm
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-muted-foreground
            prose-table:text-sm prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:border-b prose-td:border-border
            prose-img:rounded-xl prose-img:w-full prose-img:shadow-lg
            prose-li:leading-relaxed prose-ul:space-y-1 prose-ol:space-y-1
            prose-hr:border-border"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </main>
  );
}
