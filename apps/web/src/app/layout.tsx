import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
import { AuthSessionProvider } from '@/components/providers/session-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { getIntegrationsServer } from '@/lib/services/integrations';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
  title: 'VertexHub',
  description: 'VertexHub web application',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminIntegrations = await getIntegrationsServer();
  const gaId = adminIntegrations?.googleAnalytics?.trackingId || '';
  const gaEnabled = adminIntegrations?.googleAnalytics?.enabled !== false;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <AuthSessionProvider>{children}</AuthSessionProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        {gaEnabled && gaId && gaId.startsWith('G-') && (
          <GoogleAnalytics gaId={gaId} />
        )}
      </body>
    </html>
  );
}
