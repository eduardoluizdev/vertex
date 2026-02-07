import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { RegisterContent } from './_components/content';

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect('/');
  }

  return <RegisterContent />;
}
