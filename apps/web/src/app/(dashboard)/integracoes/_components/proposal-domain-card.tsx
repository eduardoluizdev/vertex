'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Globe } from 'lucide-react';
import { ProposalIntegrationForm } from '@/app/(dashboard)/propostas/_components/proposal-integration-form';

export function ProposalDomainCard({ initialWebUrl }: { initialWebUrl: string }) {
  const isConfigured = !!initialWebUrl;
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:border-blue-500/50 transition-colors group h-full">
          <div className="flex items-center gap-4 mb-3">
             <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
               <Globe className="size-5" />
             </div>
             <div className="flex-1">
               <h3 className="font-semibold text-foreground">Domínio de Propostas</h3>
               <p className="text-xs text-muted-foreground">Links personalizados</p>
             </div>
          </div>
          <div>
            <div className={`text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 border ${isConfigured ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
              <div className={`size-1.5 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'} ${!isConfigured && 'animate-pulse'}`} />
              {isConfigured ? 'Configurado' : 'Pendente'}
            </div>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col h-full sm:h-auto sm:max-h-[100dvh]">
        <SheetHeader className="px-6 py-6 border-b border-border/50 bg-muted/10 shrink-0">
          <SheetTitle className="text-xl">Domínio Personalizado (Propostas)</SheetTitle>
          <SheetDescription>
            Configure um subdomínio (ex: propostas.suaempresa.com.br) para que os links enviados não usem o domínio padrão da aplicação.
          </SheetDescription>
        </SheetHeader>
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <ProposalIntegrationForm initialWebUrl={initialWebUrl} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
