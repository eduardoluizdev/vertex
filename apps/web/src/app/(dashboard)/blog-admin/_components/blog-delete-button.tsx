'use client';

import { useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteBlogPost } from '@/actions/blog-actions';
import { useRouter } from 'next/navigation';

export function BlogDeleteButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm('Tem certeza que deseja remover este post?')) return;
    startTransition(async () => {
      const res = await deleteBlogPost(postId);
      if (res.success) router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1.5"
    >
      {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
    </Button>
  );
}
