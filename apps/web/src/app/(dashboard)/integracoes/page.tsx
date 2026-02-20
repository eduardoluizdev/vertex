import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Plug2, Mail, MessageSquare } from 'lucide-react';
import { getIntegrations } from './_actions/integrations-actions';
import { ResendCard } from './_components/resend-card';
import { WhatsappCard } from './_components/whatsapp-card';
import { getWhatsappConnectionState } from './_actions/whatsapp-actions';
import { getSelectedCompanyId } from '@/lib/cookies';

export const metadata = {
  title: 'Integrações — VertexHub',
  description: 'Configure as integrações de serviços externos como Resend, webhooks e mais.',
};

export default async function IntegracoesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const isAdmin = session.user.role === 'ADMIN';
  const selectedCompanyId = await getSelectedCompanyId();

  const [adminIntegrations, companyIntegrations, whatsappState] = await Promise.all([
    isAdmin ? getIntegrations() : Promise.resolve(null),
    selectedCompanyId ? getIntegrations(selectedCompanyId) : Promise.resolve(null),
    selectedCompanyId ? getWhatsappConnectionState(selectedCompanyId) : Promise.resolve(null),
  ]);

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
      {isAdmin && adminIntegrations && (
        <section className="space-y-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Email (Global Admin)
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>

          <ResendCard
            initialApiKey={adminIntegrations.resend.apiKey ?? ''}
            initialFrontendUrl={adminIntegrations.resend.frontendUrl ?? 'http://localhost:3000'}
            initialFromEmail={adminIntegrations.resend.fromEmail ?? ''}
            isConfigured={adminIntegrations.resend.isConfigured ?? false}
          />
        </section>
      )}

      {/* Section: Empresa integrations */}
      {selectedCompanyId && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Comunicação (Empresa)
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <WhatsappCard
              companyId={selectedCompanyId}
              initialStatus={whatsappState?.status ?? 'DISCONNECTED'}
              qrcode={whatsappState?.qrcode ?? null}
              instanceName={whatsappState?.instanceName ?? null}
            />

            {companyIntegrations && (
              <ResendCard
                initialApiKey={companyIntegrations.resend.apiKey ?? ''}
                initialFrontendUrl={companyIntegrations.resend.frontendUrl ?? 'http://localhost:3000'}
                initialFromEmail={companyIntegrations.resend.fromEmail ?? ''}
                isConfigured={companyIntegrations.resend.isConfigured ?? false}
                companyId={selectedCompanyId}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
