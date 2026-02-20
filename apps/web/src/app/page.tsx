import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { LandingContent } from './_components/landing-content';

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return <LandingContent />;
}
