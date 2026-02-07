import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { LoginContent } from './_components/content';

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect('/');
  }

  return <LoginContent />;
}
