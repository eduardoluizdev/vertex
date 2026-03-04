import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { LandingContent } from './_components/landing-content';

const API_URL = process.env.API_URL || 'https://api.vertexhub.dev';

interface RecentPost {
  id: string;
  headline: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  author: { name: string };
}

async function getRecentPosts(): Promise<RecentPost[]> {
  try {
    const res = await fetch(`${API_URL}/v1/blog/recent`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  const recentPosts = await getRecentPosts();

  return <LandingContent recentPosts={recentPosts} />;
}
