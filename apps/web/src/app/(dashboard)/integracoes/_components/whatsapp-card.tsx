'use client';

import { useState, useEffect } from 'react';
import { createWhatsappInstance, deleteWhatsappInstance, getWhatsappConnectionState, refreshWhatsappQRCode } from '../_actions/whatsapp-actions';
import { Button } from '@/components/ui/button';
import { Loader2, QrCode as QrCodeIcon, MessageCircle, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsappCardProps {
  companyId: string;
  initialStatus: string;
  qrcode: string | null;
  instanceName: string | null;
}

export function WhatsappCard({ companyId, initialStatus, qrcode: initialQrcode, instanceName: initialInstanceName }: WhatsappCardProps) {
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [qrcode, setQrcode] = useState(initialQrcode);
  const [instanceName, setInstanceName] = useState(initialInstanceName);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === 'CONNECTING') {
      interval = setInterval(async () => {
        const state = await getWhatsappConnectionState(companyId);
        if (state) {
          setStatus(state.status);
          setQrcode(state.qrcode);
          setInstanceName(state.instanceName);
        }
      }, 5000); // pull every 5s while connecting
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, companyId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('whatsapp-status-change'));
    }
  }, [status]);

  const handleCreateInstance = async () => {
    setLoading(true);
    const result = await createWhatsappInstance(companyId);
    
    if (result.success) {
      toast.success('Instância criada com sucesso!');
      
      setStatus('CONNECTING');
      
      const state = await getWhatsappConnectionState(companyId);
      if (state) {
        setStatus(state.status);
        setQrcode(state.qrcode);
        setInstanceName(state.instanceName);
      }
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    const result = await deleteWhatsappInstance(companyId);
    if (result.success) {
      toast.success('Instância desconectada e deletada.');
      setStatus('DISCONNECTED');
      setQrcode(null);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const refreshStatus = async () => {
     setLoading(true);
     const state = await getWhatsappConnectionState(companyId);
     if (state) {
        setStatus(state.status);
        setQrcode(state.qrcode);
        setInstanceName(state.instanceName);
     }
     setLoading(false);
  };

  const handleRefreshQR = async () => {
    setIsRefreshing(true);
    const result = await refreshWhatsappQRCode(companyId);
    if (result.success) {
      toast.success('Novo QR Code solicitado.');
      // The polling will naturally pick up the new QR in the next 5 seconds
      // but we can also instantly fetch the status
      const state = await getWhatsappConnectionState(companyId);
      if (state) {
        setQrcode(state.qrcode);
        setStatus(state.status);
      }
    } else {
      toast.error(result.error);
    }
    setIsRefreshing(false);
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="flex size-12 items-center justify-center rounded-lg bg-green-500/10 shrink-0">
            <MessageCircle className="size-6 text-green-500" />
          </div>
          <div>
             <div className="flex items-center gap-2">
               <h3 className="font-semibold text-lg">WhatsApp API (Evolution)</h3>
               {status === 'CONNECTED' && (
                 <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-500/10 text-green-500 border-green-500/20">
                   Conectado
                 </span>
               )}
               {status === 'CONNECTING' && (
                 <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-500 border-blue-500/20">
                   Aguardando Conexão
                 </span>
               )}
               {status === 'DISCONNECTED' && (
                 <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">
                   Desconectado
                 </span>
               )}
             </div>
             <p className="text-sm text-muted-foreground mt-1">
               Conecte uma instância do WhatsApp para enviar notificações e campanhas aos seus clientes.
             </p>
             {instanceName && (
               <p className="text-xs text-muted-foreground mt-1">Instância: {instanceName}</p>
             )}
          </div>
        </div>
        
        <div className="flex gap-2">
           {status !== 'DISCONNECTED' && (
              <Button size="icon" variant="outline" onClick={refreshStatus} title="Atualizar Status">
                <RefreshCw className="size-4" />
              </Button>
           )}
           {status === 'CONNECTED' && (
             <Button variant="destructive" onClick={handleDisconnect} disabled={loading}>
               {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Trash2 className="size-4 mr-2" />}
               Desconectar
             </Button>
           )}
        </div>
      </div>

      {status === 'CONNECTING' && (
        <div className="bg-muted/50 p-6 border-t flex flex-col items-center justify-center py-10 text-center">
          {qrcode ? (
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white p-2 rounded-lg inline-block">
                <img 
                  src={`${qrcode}`} 
                  alt="QR Code WhatsApp" 
                  width={320} 
                  height={320}
                  className="rounded-md"
                />
              </div>
              <div className="text-center">
                <h4 className="font-medium">Leia o QR Code</h4>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e aponte a câmera.
                </p>
              </div>
              
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleRefreshQR} 
                disabled={isRefreshing || loading}
                className="mt-2"
              >
                {isRefreshing ? <Loader2 className="size-4 mr-2 animate-spin" /> : <RefreshCw className="size-4 mr-2" />}
                Gerar Novo QR Code
              </Button>
            </div>
          ) : (
             <div className="flex flex-col items-center gap-3">
               <Loader2 className="size-8 animate-spin text-muted-foreground" />
               <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
             </div>
          )}

          <div className="mt-6 flex justify-center w-full">
            <Button variant="outline" onClick={handleDisconnect} disabled={loading} className="text-destructive hover:text-destructive">
               <Trash2 className="size-4 mr-2" />
               Cancelar/Excluir Instância
            </Button>
          </div>
        </div>
      )}

      {status === 'DISCONNECTED' && (
        <div className="bg-muted/50 p-6 border-t flex flex-col items-start gap-4">
           <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-500/10 text-blue-700 dark:text-blue-400 p-3 rounded-md w-full">
             <AlertCircle className="size-4 shrink-0" />
             <p>Esta integração é exclusiva para a empresa atual e não afeta outras organizações.</p>
           </div>
           
           <Button onClick={handleCreateInstance} disabled={loading} className="w-full sm:w-auto">
             {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <QrCodeIcon className="size-4 mr-2" />}
             Configurar WhatsApp
           </Button>
        </div>
      )}
    </div>
  );
}
