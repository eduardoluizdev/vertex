import { Metadata } from 'next';
import { ResetPasswordContent } from './_components/content';

export const metadata: Metadata = {
  title: 'Nova Senha — VertexHub',
  description: 'Crie uma nova senha segura para sua conta VertexHub.',
};

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}
