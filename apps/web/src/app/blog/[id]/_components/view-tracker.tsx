'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vertexhub.dev';

interface ViewTrackerProps {
  postId: string;
  initialViews: number;
}

export function ViewTracker({ postId, initialViews }: ViewTrackerProps) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    fetch(`${API_URL}/v1/blog/${postId}/view`, { method: 'POST' })
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.viewCount === 'number') setViews(data.viewCount);
      })
      .catch(() => {});
  }, [postId]);

  return (
    <span className="flex items-center gap-1.5">
      <Eye className="size-4" />
      {views.toLocaleString('pt-BR')} {views === 1 ? 'visualização' : 'visualizações'}
    </span>
  );
}
