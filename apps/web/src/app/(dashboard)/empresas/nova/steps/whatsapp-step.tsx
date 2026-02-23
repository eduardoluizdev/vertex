'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { fetchClient } from '@/lib/fetch-client';
import { Button } from '@/components/ui/button';
import { RefreshCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import { getWhatsappConnectionState } from '@/app/(dashboard)/integracoes/_actions/whatsapp-actions';

interface WhatsappStepProps {
  companyId: string;
  onSuccess: () => void;
  onSkip: () => void;
}

export function WhatsappStep({ companyId, onSuccess, onSkip }: WhatsappStepProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'LOADING' | 'DISCONNECTED' | 'WAITING_QR' | 'CONNECTED'>('LOADING');
  const [qrCodeHtml, setQrCodeHtml] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const state = await getWhatsappConnectionState(companyId);
      
      if (!state) {
        setStatus('DISCONNECTED');
        return;
      }
      
      if (state.status === 'CONNECTED') {
        setStatus('CONNECTED');
      } else {
        setStatus('WAITING_QR');
        if (state.qrcode) {
          setQrCodeHtml(state.qrcode);
        }
      }
    } catch (error) {
      console.error('Failed to check WhatsApp status', error);
    }
  }, [companyId]);

  useEffect(() => {
    // Initial check
    checkStatus();

    // Polling every 5 seconds if waiting for QR
    const interval = setInterval(() => {
      if (status === 'WAITING_QR' || status === 'LOADING') {
        checkStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [checkStatus, status]);

  const handleStartConnection = async () => {
    try {
      setStatus('LOADING');
      const response = await fetchClient(`/v1/whatsapp/instance/${companyId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao iniciar conexão');
      }
      
      await checkStatus();
    } catch (error) {
      toast.error('Erro ao conectar com WhatsApp');
      setStatus('DISCONNECTED');
    }
  };

  const handleRefreshQR = async () => {
    try {
      setIsRefreshing(true);
      await fetchClient(`/v1/whatsapp/instance/${companyId}/refresh`, {
        method: 'GET',
      });
      await checkStatus();
    } catch (error) {
      toast.error('Erro ao atualizar QR Code');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (status === 'CONNECTED') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        <div className="flex size-20 items-center justify-center border-4 border-green-500/20 bg-green-500/10 rounded-full">
          <CheckCircle2 className="size-10 text-green-500" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">WhatsApp Conectado!</h3>
          <p className="text-muted-foreground">Sua empresa já está pronta para enviar mensagens.</p>
        </div>
        <Button onClick={onSuccess} size="lg" className="w-full sm:w-auto mt-4 px-8">
          Continuar <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold">Conectar WhatsApp</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Conecte um número de WhatsApp para sua empresa enviar mensagens nas campanhas.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-6 min-h-[300px] border rounded-lg bg-card text-card-foreground shadow-sm">
        {status === 'LOADING' ? (
          <div className="flex flex-col items-center gap-4">
            <RefreshCcw className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : status === 'DISCONNECTED' ? (
          <div className="flex flex-col items-center gap-4">
            <Image src="/whatsapp-logo.svg" alt="WhatsApp" width={48} height={48} className="opacity-80" />
            <Button onClick={handleStartConnection}>Gerar QR Code</Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            {qrCodeHtml ? (
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                {/* Evolution API returns a base64 image or a direct SVG/HTML. We assume HTML/SVG format string or base64 here. The action parses it. */}
                {qrCodeHtml.startsWith('<svg') || qrCodeHtml.startsWith('<img') ? (
                  <div dangerouslySetInnerHTML={{ __html: qrCodeHtml }} className="max-w-[250px] w-full" />
                ) : (
                  <img src={qrCodeHtml} alt="QR Code" className="w-[250px] h-[250px] object-contain" />
                )}
              </div>
            ) : (
              <div className="flex size-[250px] items-center justify-center bg-muted rounded-xl border">
                <RefreshCcw className="size-8 animate-spin text-muted-foreground" />
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

      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onSkip}>
          Pular esta etapa
        </Button>
        <Button onClick={onSuccess} disabled={true}>
          Avançar
        </Button>
      </div>
    </div>
  );
}
