'use client';

import { useEffect, useState } from 'react';
import { getWhatsappConnectionState } from '@/app/(dashboard)/integracoes/_actions/whatsapp-actions';
import { MessageCircle, AlertCircle, Phone, Smartphone, PhoneOff } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function WhatsappStatusBadge({ companyId }: { companyId: string }) {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      if (!companyId) return;
      const state = await getWhatsappConnectionState(companyId);
      if (isMounted) {
        setStatus(state?.status || 'DISCONNECTED');
      }
    };

    checkStatus();

    // Check every 30 seconds globally
    interval = setInterval(checkStatus, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [companyId]);

  if (!companyId || !status) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
            {status === 'CONNECTED' && <MessageCircle className="size-5 text-green-500" />}
            {status === 'CONNECTING' && <MessageCircle className="size-5 text-blue-500 animate-pulse" />}
            {status === 'DISCONNECTED' && <MessageCircle className="size-5 text-muted-foreground opacity-50" />}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="flex flex-col gap-1 p-3">
          <p className="font-semibold text-sm">WhatsApp da Empresa</p>
          {status === 'CONNECTED' && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
               <span className="size-2 rounded-full bg-green-500" />
               Conectado e pronto
            </p>
          )}
          {status === 'CONNECTING' && (
             <p className="text-xs text-muted-foreground flex items-center gap-1">
               <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
               Aguardando pareamento
             </p>
          )}
          {status === 'DISCONNECTED' && (
             <p className="text-xs text-muted-foreground flex items-center gap-1">
               <span className="size-2 rounded-full bg-red-500" />
               Desconectado
             </p>
          )}
          {status !== 'CONNECTED' && (
             <p className="text-[10px] text-muted-foreground mt-1 border-t pt-1">
               Vá em Integrações para configurar.
             </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
