'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Clock, Settings as SettingsIcon, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchClient } from '@/lib/fetch-client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';

interface NotificationsCardProps {
  company: {
    id: string;
    expirationWarningEnabled: boolean;
    expirationWarningDays: number;
    dispatchTime: string;
  };
}

export function NotificationsCard({ company }: NotificationsCardProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const [expirationWarningEnabled, setExpirationWarningEnabled] = useState(company.expirationWarningEnabled);
  const [expirationWarningDays, setExpirationWarningDays] = useState(company.expirationWarningDays);
  const [dispatchTime, setDispatchTime] = useState(company.dispatchTime);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const payload = {
        expirationWarningEnabled,
        expirationWarningDays: Number(expirationWarningDays),
        dispatchTime,
      };

      const response = await fetchClient(`/v1/companies/${company.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar configurações');
      }

      toast.success('Configurações atualizadas com sucesso!');
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar as configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:border-violet-500/50 transition-colors group h-full">
          <div className="flex items-center gap-4 mb-3">
             <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 group-hover:scale-110 transition-transform">
               <Mail className="size-5" />
             </div>
             <div className="flex-1">
               <h3 className="font-semibold text-foreground">Alertas Automação</h3>
               <p className="text-xs text-muted-foreground">Vencimentos e rotinas</p>
             </div>
          </div>
          <div>
            <div
              className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border ${
                expirationWarningEnabled
                  ? 'bg-violet-500/10 text-violet-500 border-violet-500/20'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              <div
                className={`size-1.5 rounded-full ${
                  expirationWarningEnabled ? 'bg-violet-500' : 'bg-muted-foreground'
                }`}
              />
              {expirationWarningEnabled ? 'Avisos Ativos' : 'Avisos Desativados'}
            </div>
          </div>
        </div>
      </SheetTrigger>

      <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col h-full sm:h-auto sm:max-h-[100dvh]">
        <SheetHeader className="px-6 py-6 border-b border-border/50 bg-muted/10 shrink-0">
          <SheetTitle className="text-xl">Alertas e Automação</SheetTitle>
          <SheetDescription>Configure as rotinas automáticas de notificação para seus clientes.</SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-8 flex-1 overflow-y-auto">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
             <div className="p-5 bg-muted/10 border-b border-border/50">
                <h3 className="text-base font-semibold text-foreground">Avisos de Vencimento</h3>
                <p className="text-sm text-muted-foreground mt-1 tracking-tight">Notifica automaticamente o cliente antes do término do serviço ativo.</p>
             </div>
             <div className="p-6 space-y-8">
                {/* Toggle Notificações */}
                <div className="flex items-start justify-between space-x-2">
                  <div className="flex flex-col space-y-1.5 pr-4">
                    <Label htmlFor="expiration-emails" className="text-base font-medium">Habilitar Avisos</Label>
                    <span className="text-sm text-muted-foreground">
                      Enviar formato de alerta pelos canais ativos (ex. WhatsApp, Email).
                    </span>
                  </div>
                  <div className="h-6 flex items-center shrink-0">
                    <Switch 
                      id="expiration-emails" 
                      checked={expirationWarningEnabled} 
                      onCheckedChange={setExpirationWarningEnabled} 
                    />
                  </div>
                </div>
                
                {/* Dias de Antecedência */}
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1.5 flex-1 pr-4">
                    <Label htmlFor="expiration-days" className="text-base font-medium">Dias de Antecedência</Label>
                    <span className="text-sm text-muted-foreground">
                      Quantos dias antes do vencimento disparar o alerta.
                    </span>
                  </div>
                  <div className="w-24 shrink-0">
                    <div className="relative">
                      <Input 
                        id="expiration-days" 
                        type="number" 
                        min="1" 
                        max="30"
                        value={expirationWarningDays}
                        onChange={(e) => setExpirationWarningDays(parseInt(e.target.value) || 1)}
                        disabled={!expirationWarningEnabled}
                        className="text-right pr-10 bg-background"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        dias
                      </span>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
             <div className="p-5 bg-muted/10 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" /> Rotina Diária
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 tracking-tight">Horário para verificação e disparo das automações do sistema.</p>
                </div>
             </div>
             <div className="p-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1.5 pr-4">
                    <Label htmlFor="dispatch-time" className="text-base font-medium">
                      Horário de Disparo
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      Padrão sugerido (09:00).
                    </span>
                  </div>
                  <div className="w-28 shrink-0">
                    <Input 
                      id="dispatch-time" 
                      type="time" 
                      value={dispatchTime}
                      onChange={(e) => setDispatchTime(e.target.value)}
                      className="bg-background text-center font-medium"
                    />
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-muted/10 border-t border-border mt-auto shrink-0 flex items-center justify-between">
           <div className="flex items-center gap-2 text-muted-foreground">
              <SettingsIcon className="size-4 shrink-0" />
              <p className="text-xs hidden sm:block">Aplica-se a todos os serviços com vencimento.</p>
           </div>
           <Button onClick={handleSave} disabled={isSaving} className="gap-2">
             {isSaving && <Loader2 className="size-4 animate-spin" />}
             {!isSaving && <Save className="size-4" />}
             Salvar Mudanças
           </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
