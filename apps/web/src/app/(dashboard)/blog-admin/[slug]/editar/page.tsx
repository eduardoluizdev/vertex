import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getBlogPostBySlug } from '@/actions/blog-actions';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { PostEditor } from '../../_components/post-editor';

export const metadata = {
  title: 'Editar Post — Blog VertexHub',
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditarPostPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-4 mb-3">
          <Link
            href="/blog-admin"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Voltar ao Blog
          </Link>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-vibe-surface border border-vibe-primary/20 shadow-inner">
            <BookOpen className="size-6 text-vibe-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Post</h1>
            <p className="text-base text-muted-foreground mt-1 line-clamp-1">
              {post.headline}
            </p>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent mt-6" />
      </div>

      <PostEditor post={post} />
    </div>
  );
}
