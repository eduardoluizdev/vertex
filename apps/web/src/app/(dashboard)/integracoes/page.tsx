import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Plug2, Mail, MessageSquare } from 'lucide-react';
import { getIntegrationsServer } from '@/lib/services/integrations';
import { ResendCard } from './_components/resend-card';
import { WhatsappCard } from './_components/whatsapp-card';
import { getWhatsappConnectionStateServer } from '@/lib/services/whatsapp';
import { getSelectedCompanyId } from '@/lib/cookies';
import { getDomainStatus } from './_actions/domain-actions';
import { ProposalDomainCard } from './_components/proposal-domain-card';
import { getWhatsappTemplate, getProposalIntegration } from '@/app/(dashboard)/propostas/_actions/proposal-actions';
import { apiClient } from '@/lib/api';
import { NotificationsCard } from './_components/notifications-card';

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

  const [
    adminIntegrations, 
    companyIntegrations, 
    whatsappState, 
    domainStatus, 
    whatsappTemplate, 
    proposalIntegration, 
    companyData
  ] = await Promise.all([
    isAdmin ? getIntegrationsServer() : Promise.resolve(null),
    selectedCompanyId ? getIntegrationsServer(selectedCompanyId) : Promise.resolve(null),
    selectedCompanyId ? getWhatsappConnectionStateServer(selectedCompanyId) : Promise.resolve(null),
    selectedCompanyId ? getDomainStatus(selectedCompanyId) : Promise.resolve(null),
    selectedCompanyId ? getWhatsappTemplate().catch(() => null) : Promise.resolve(null),
    selectedCompanyId ? getProposalIntegration().catch(() => ({ webUrl: '' })) : Promise.resolve(null),
    selectedCompanyId ? apiClient(`/v1/companies/${selectedCompanyId}`).then(res => res.json()).catch(() => null) : Promise.resolve(null),
  ]);

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 shadow-inner">
            <Plug2 className="size-6 text-violet-500 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Integrações
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Configure serviços externos para expandir as funcionalidades do VertexHub.
            </p>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent mt-6" />
      </div>

      {/* Section: Email */}
      {isAdmin && adminIntegrations && (
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Mail className="size-4 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Email (Global Admin)
              </h2>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              Configurações unificadas de disparo de emails para o sistema.
            </p>
          </div>

          <div className="pl-0 md:pl-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ResendCard
              initialApiKey={adminIntegrations.resend.apiKey ?? ''}
              initialFrontendUrl={adminIntegrations.resend.frontendUrl ?? 'http://localhost:3000'}
              initialFromEmail={adminIntegrations.resend.fromEmail ?? ''}
              isConfigured={adminIntegrations.resend.isConfigured ?? false}
            />
          </div>
        </section>
      )}

      {/* Section: Empresa integrations */}
      {selectedCompanyId && (
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <MessageSquare className="size-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Comunicação (Empresa)
              </h2>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              Canais de atendimento e comunicação específicos da sua empresa.
            </p>
          </div>

          <div className="pl-0 md:pl-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <WhatsappCard
              companyId={selectedCompanyId}
              initialStatus={whatsappState?.status ?? 'DISCONNECTED'}
              qrcode={whatsappState?.qrcode ?? null}
              instanceName={whatsappState?.instanceName ?? null}
              initialTemplate={whatsappTemplate?.template}
              initialFollowUpTemplate={whatsappTemplate?.followUpTemplate}
            />

            {companyIntegrations && (
              <ResendCard
                initialApiKey={companyIntegrations.resend.apiKey ?? ''}
                initialFrontendUrl={companyIntegrations.resend.frontendUrl ?? 'http://localhost:3000'}
                initialFromEmail={companyIntegrations.resend.fromEmail ?? ''}
                isConfigured={companyIntegrations.resend.isConfigured ?? false}
                companyId={selectedCompanyId}
                initialDomain={domainStatus?.domain ?? null}
                initialStatus={domainStatus?.status ?? 'not_started'}
                initialRecords={domainStatus?.records ?? []}
              />
            )}

            <ProposalDomainCard 
              initialWebUrl={proposalIntegration?.webUrl || ''} 
            />

            {companyData && (
              <NotificationsCard company={companyData} />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
