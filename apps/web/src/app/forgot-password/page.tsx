import { Metadata } from 'next';
import { ForgotPasswordContent } from './_components/content';

export const metadata: Metadata = {
  title: 'Recuperar Senha — VertexHub',
  description: 'Informe seu email para receber as instruções de recuperação de senha.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}
