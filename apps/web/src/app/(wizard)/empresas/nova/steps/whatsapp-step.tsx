'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import { 
  getWhatsappConnectionState, 
  createWhatsappInstance, 
  refreshWhatsappQRCode 
} from '@/app/(dashboard)/integracoes/_actions/whatsapp-actions';

interface WhatsappStepProps {
  companyId: string;
  onSuccess: () => void;
  onSkip: () => void;
}

export function WhatsappStep({ companyId, onSuccess, onSkip }: WhatsappStepProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('LOADING');
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const initializingRef = useRef(false);

  // Initial fetch check
  useEffect(() => {
    let mounted = true;

    async function initCheck() {
      const state = await getWhatsappConnectionState(companyId);
      if (!mounted) return;

      if (!state || state.status === 'DISCONNECTED') {
        if (!initializingRef.current) {
          initializingRef.current = true;
          setLoading(true);
          const result = await createWhatsappInstance(companyId);
          if (!mounted) return;
          
          if (result.success) {
            setStatus('CONNECTING');
            const newState = await getWhatsappConnectionState(companyId);
            if (newState && mounted) {
              setStatus(newState.status);
              setQrcode(newState.qrcode);
            }
          } else {
            toast.error(result.error);
            setStatus('DISCONNECTED');
          }
          if (mounted) setLoading(false);
        } else {
          setStatus('DISCONNECTED');
        }
      } else {
        setStatus(state.status);
        setQrcode(state.qrcode);
      }
    }
    
    initCheck();

    return () => {
      mounted = false;
    };
  }, [companyId]);

  // Polling check identical to WhatsappCard
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === 'CONNECTING') {
      interval = setInterval(async () => {
        const state = await getWhatsappConnectionState(companyId);
        if (state) {
          setStatus(state.status);
          setQrcode(state.qrcode);
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, companyId]);

  const handleStartConnection = async () => {
    setLoading(true);
    const result = await createWhatsappInstance(companyId);
    
    if (result.success) {
      toast.success('Instância criada com sucesso!');
      setStatus('CONNECTING');
      
      const state = await getWhatsappConnectionState(companyId);
      if (state) {
        setStatus(state.status);
        setQrcode(state.qrcode);
      }
    } else {
      toast.error(result.error);
      setStatus('DISCONNECTED');
    }
    setLoading(false);
  };

  const handleRefreshQR = async () => {
    setIsRefreshing(true);
    const result = await refreshWhatsappQRCode(companyId);

    if (result.success) {
      toast.success('Novo QR Code solicitado.');
      const state = await getWhatsappConnectionState(companyId);
      if (state) {
        setStatus(state.status);
        setQrcode(state.qrcode);
      }
    } else {
      toast.error(result.error || 'Erro ao gerar novo QR Code');
    }
    setIsRefreshing(false);
  };

  if (status === 'CONNECTED') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        <div className="flex size-20 items-center justify-center border-4 border-emerald-500/20 bg-emerald-500/10 rounded-full">
          <CheckCircle2 className="size-10 text-emerald-500" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">WhatsApp Conectado!</h3>
          <p className="text-muted-foreground">Sua empresa já está pronta para enviar mensagens.</p>
        </div>
        <div className="pt-4 flex justify-center w-full">
          <Button onClick={onSuccess} size="lg" className="rounded-full px-12">
             Avançar para próximo passo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-6 min-h-[300px]">
        {status === 'LOADING' ? (
          <div className="flex flex-col items-center gap-4">
            <RefreshCcw className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : status === 'DISCONNECTED' ? (
          <div className="flex flex-col items-center gap-4">
            <Image src="/whatsapp-logo.svg" alt="WhatsApp" width={48} height={48} className="opacity-80" />
            <Button onClick={handleStartConnection} disabled={loading} size="lg" className="px-8 rounded-full">
              {loading ? 'Iniciando instânica...' : 'Gerar QR Code'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            {qrcode ? (
              <div className="bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 dark:border-slate-800">
                <img 
                  src={`${qrcode}`} 
                  alt="QR Code" 
                  className="w-[250px] h-[250px] object-contain mix-blend-multiply" 
                />
              </div>
            ) : (
              <div className="flex size-[250px] flex-col gap-2 items-center justify-center bg-muted/50 rounded-2xl border border-dashed">
                <RefreshCcw className="size-8 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Buscando na API...</span>
              </div>
            )}
            
            <div className="text-center space-y-1">
              <p className="font-medium text-sm">Escaneie o QR Code</p>
              <p className="text-xs text-muted-foreground max-w-xs text-balance">
                Abra o WhatsApp no seu celular, vá em Aparelhos conectados e aponte a câmera.
              </p>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshQR} 
              disabled={isRefreshing}
              className="mt-2"
            >
              <RefreshCcw className={`mr-2 size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar QR Code
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onSkip} className="rounded-full px-6">
          Pular
        </Button>
        <Button onClick={onSuccess} disabled={true} size="lg" className="rounded-full px-8">
          Avançar
        </Button>
      </div>
    </div>
  );
}
