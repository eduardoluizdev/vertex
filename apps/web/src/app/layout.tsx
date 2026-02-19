import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
import { AuthSessionProvider } from '@/components/providers/session-provider';

export const metadata: Metadata = {
  title: 'VertexHub',
  description: 'VertexHub web application',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
