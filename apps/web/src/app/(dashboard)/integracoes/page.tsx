import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Plug2, Mail } from 'lucide-react';
import { getIntegrations } from './_actions/integrations-actions';
import { ResendCard } from './_components/resend-card';

export const metadata = {
  title: 'Integrações — VertexHub',
  description: 'Configure as integrações de serviços externos como Resend, webhooks e mais.',
};

export default async function IntegracoesPage() {
  // Guard: only ADMIN users can access this page
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const integrations = await getIntegrations();

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20">
            <Plug2 className="size-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Integrações
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure serviços externos para expandir as funcionalidades do VertexHub.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Email */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Email
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <ResendCard
          initialApiKey={integrations?.resend.apiKey ?? ''}
          initialFrontendUrl={integrations?.resend.frontendUrl ?? 'http://localhost:3000'}
          initialFromEmail={integrations?.resend.fromEmail ?? ''}
          isConfigured={integrations?.resend.isConfigured ?? false}
        />
      </section>
    </div>
  );
}
