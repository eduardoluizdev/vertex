import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Mail, Clock, Settings as SettingsIcon, Bell, MessageCircle, Globe } from 'lucide-react';
import { getWhatsappTemplate, getProposalIntegration } from '@/app/(dashboard)/propostas/_actions/proposal-actions';
import { WhatsappTemplateForm } from '@/app/(dashboard)/propostas/_components/whatsapp-template-form';
import { ProposalIntegrationForm } from '@/app/(dashboard)/propostas/_components/proposal-integration-form';

export default async function SettingsPage() {
  const [tplRecord, integration] = await Promise.all([
    getWhatsappTemplate().catch(() => null),
    getProposalIntegration().catch(() => ({ webUrl: '' })),
  ]);
  const currentTemplate = tplRecord?.template;
  const currentFollowUpTemplate = tplRecord?.followUpTemplate;
  return (
    <div className="min-h-screen p-6 md:p-8 space-y-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500/20 to-zinc-500/20 border border-slate-500/20 shadow-inner">
            <SettingsIcon className="size-6 text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Configurações
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Gerencie as configurações e preferências do sistema.
            </p>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent mt-6" />
      </div>

      <section className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/30">
              <Bell className="size-4 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Notificações
            </h2>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            Configure alertas por email e horários de processamento.
          </p>
        </div>

        <div className="pl-0 md:pl-10 grid gap-6 md:max-w-3xl">
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/10 pb-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Notificações de Email</CardTitle>
              </div>
              <CardDescription>
                Configure quando os emails automáticos são enviados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-start justify-between space-x-2">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="expiration-emails" className="text-base font-medium">Avisos de Vencimento</Label>
                  <span className="text-sm text-muted-foreground">
                    Enviar emails automaticamente 2 dias antes do vencimento do serviço.
                  </span>
                </div>
                <div className="h-6 flex items-center">
                  <Switch id="expiration-emails" defaultChecked disabled />
                </div>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1.5">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" /> 
                    Horário de Disparo
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    Os emails são processados diariamente no horário configurado.
                  </span>
                </div>
                <div className="text-sm font-semibold bg-muted text-foreground px-3 py-1.5 rounded-lg border border-border/50">
                  09:00 AM
                </div>
              </div>

              <div className="pt-4 mt-2 border-t flex items-center gap-2">
                <SettingsIcon className="size-3 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Para alterar estas configurações, contate o administrador do sistema.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Globe className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Domínio Personalizado — Propostas
            </h2>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            Configure o endereço próprio da empresa para os links de proposta enviados aos clientes.
          </p>
        </div>

        <div className="pl-0 md:pl-10 grid gap-6 md:max-w-3xl">
          {/* URL Card */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/10 pb-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Domínio Personalizado</CardTitle>
              </div>
              <CardDescription>
                Configure um subdomínio da sua empresa (ex: <code className="font-mono text-xs">propostas.suaempresa.com.br</code>) para que os links das propostas não usem o domínio padrão da aplicação.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ProposalIntegrationForm initialWebUrl={integration.webUrl} />
            </CardContent>
          </Card>

          {/* WhatsApp Template Card  */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/10 pb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Template da Mensagem WhatsApp</CardTitle>
              </div>
              <CardDescription>
                Use variáveis dinâmicas para personalizar a mensagem. Clique nelas para inserir.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <WhatsappTemplateForm 
                initialTemplate={currentTemplate} 
                initialFollowUpTemplate={currentFollowUpTemplate} 
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
