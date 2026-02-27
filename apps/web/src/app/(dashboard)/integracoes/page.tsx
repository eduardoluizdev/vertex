import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Plug2, Mail, MessageSquare, Globe } from 'lucide-react';
import { getIntegrationsServer } from '@/lib/services/integrations';
import { ResendCard } from './_components/resend-card';
import { GoogleAnalyticsCard } from './_components/google-analytics-card';
import { WhatsappCard } from './_components/whatsapp-card';
import { AsaasCard } from './_components/asaas-card';
import { AbacatePayCard } from './_components/abacatepay-card';
import { getWhatsappConnectionStateServer } from '@/lib/services/whatsapp';
import { getSelectedCompanyId } from '@/lib/cookies';
import { getDomainStatus } from './_actions/domain-actions';
import { ProposalDomainCard } from './_components/proposal-domain-card';
import { getWhatsappTemplate, getProposalIntegration } from '@/app/(dashboard)/propostas/_actions/proposal-actions';
import { apiClient } from '@/lib/api';
import { NotificationsCard } from './_components/notifications-card';
import { GithubOauthCard } from './_components/github-oauth-card';

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
    selectedCompanyId ? apiClient(`/v1/companies/${selectedCompanyId}`).then((res: Response) => res.json()).catch(() => null) : Promise.resolve(null),
  ]);

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-vibe-surface border border-vibe-primary/20 shadow-inner">
            <Plug2 className="size-6 text-vibe-primary" />
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
              <div className="flex size-8 items-center justify-center rounded-lg bg-vibe-surface border border-vibe-muted/10">
                <Globe className="size-4 text-vibe-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Configurações Globais (Admin)
              </h2>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              Configurações unificadas aplicadas a todo o sistema.
            </p>
          </div>

          <div className="pl-0 md:pl-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ResendCard
              initialApiKey={adminIntegrations.resend.apiKey ?? ''}
              initialFrontendUrl={adminIntegrations.resend.frontendUrl ?? 'https://vertexhub.dev'}
              initialFromEmail={adminIntegrations.resend.fromEmail ?? ''}
              isConfigured={adminIntegrations.resend.isConfigured ?? false}
            />
            <GoogleAnalyticsCard
              initialTrackingId={adminIntegrations.googleAnalytics?.trackingId ?? ''}
              isConfigured={adminIntegrations.googleAnalytics?.isConfigured ?? false}
            />
            <GithubOauthCard
              initialClientId={adminIntegrations.githubOauth?.clientId ?? ''}
              initialClientSecret={adminIntegrations.githubOauth?.clientSecret ?? ''}
              isConfigured={adminIntegrations.githubOauth?.isConfigured ?? false}
            />
          </div>
        </section>
      )}

      {/* Section: Empresa integrations */}
      {selectedCompanyId && (
        <div className="space-y-10">
          {/* Comunicação */}
          <section className="space-y-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-vibe-surface border border-vibe-muted/10">
                  <MessageSquare className="size-4 text-vibe-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Comunicação
                </h2>
              </div>
              <p className="text-sm text-muted-foreground ml-10">
                Canais de atendimento, email e notificações.
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
                  initialFrontendUrl={companyIntegrations.resend.frontendUrl ?? 'https://vertexhub.dev'}
                  initialFromEmail={companyIntegrations.resend.fromEmail ?? ''}
                  isConfigured={companyIntegrations.resend.isConfigured ?? false}
                  companyId={selectedCompanyId}
                  initialDomain={domainStatus?.domain ?? null}
                  initialStatus={domainStatus?.status ?? 'not_started'}
                  initialRecords={domainStatus?.records ?? []}
                />
              )}

              {companyData && (
                <NotificationsCard company={companyData} />
              )}
            </div>
          </section>

          {/* Pagamentos */}
          <section className="space-y-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-vibe-surface border border-vibe-muted/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-vibe-primary"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Pagamentos
                </h2>
              </div>
              <p className="text-sm text-muted-foreground ml-10">
                Gateways de pagamento para suas propostas e serviços.
              </p>
            </div>

            <div className="pl-0 md:pl-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companyIntegrations && (
                <AsaasCard
                  initialApiKey={companyIntegrations.asaas?.apiKey ?? ''}
                  isConfigured={companyIntegrations.asaas?.isConfigured ?? false}
                  initialIsSandbox={companyIntegrations.asaas?.isSandbox ?? false}
                  companyId={selectedCompanyId}
                />
              )}

              {companyIntegrations && (
                <AbacatePayCard
                  initialApiKey={companyIntegrations.abacatepay?.apiKey ?? ''}
                  isConfigured={companyIntegrations.abacatepay?.isConfigured ?? false}
                  initialIsSandbox={companyIntegrations.abacatepay?.isSandbox ?? false}
                  companyId={selectedCompanyId}
                />
              )}
            </div>
          </section>

          {/* Domínios & Links */}
          <section className="space-y-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-vibe-surface border border-vibe-muted/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-vibe-primary"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Domínios & Links
                </h2>
              </div>
              <p className="text-sm text-muted-foreground ml-10">
                Configurações de domínios personalizados.
              </p>
            </div>

            <div className="pl-0 md:pl-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProposalDomainCard 
                initialWebUrl={proposalIntegration?.webUrl || ''} 
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
