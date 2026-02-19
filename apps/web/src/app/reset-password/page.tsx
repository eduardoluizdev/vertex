import { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordContent } from './_components/content';

export const metadata: Metadata = {
  title: 'Nova Senha — VertexHub',
  description: 'Crie uma nova senha segura para sua conta VertexHub.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
