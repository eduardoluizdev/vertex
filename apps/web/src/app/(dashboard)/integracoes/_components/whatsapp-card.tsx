'use client';

import { useState, useEffect } from 'react';
import { createWhatsappInstance, deleteWhatsappInstance, getWhatsappConnectionState, refreshWhatsappQRCode } from '../_actions/whatsapp-actions';
import { Button } from '@/components/ui/button';
import { Loader2, QrCode as QrCodeIcon, MessageCircle, AlertCircle, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { fetchClient } from '@/lib/fetch-client';

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
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Mensagem de Teste');
  const [testing, setTesting] = useState(false);

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

  const handleTestMessage = async () => {
    if (!testNumber) {
      toast.error('Informe um número de telefone com DDD (ex: 11999999999)');
      return;
    }
    setTesting(true);
    const numericNumber = testNumber.replace(/\D/g, '');
    const reqPhone = numericNumber.length === 10 || numericNumber.length === 11 ? `55${numericNumber}` : numericNumber;

    try {
      const response = await fetchClient(`/v1/whatsapp/send-message/${companyId}`, {
        method: 'POST',
        body: JSON.stringify({ number: reqPhone, text: testMessage }),
      });

      if (response.ok) {
        toast.success('Mensagem de teste enviada!');
        setTestNumber('');
      } else {
        const error = await response.text();
        toast.error(`Falha ao enviar: ${error}`);
      }
    } catch (e: any) {
      toast.error(`Erro: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md">
      {/* Card Header */}
      <div className="relative overflow-hidden px-6 py-5 border-b border-border bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* WhatsApp Logo/Icon */}
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 shrink-0">
              <MessageCircle className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">WhatsApp API</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                  Evolution API
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Conecte WhatsApp para notificações e campanhas
              </p>
              {instanceName && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Instância: {instanceName}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border shrink-0 ${
                status === 'CONNECTED'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : status === 'CONNECTING'
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              <div
                className={`size-1.5 rounded-full ${
                  status === 'CONNECTED' 
                    ? 'bg-emerald-500' 
                    : status === 'CONNECTING' 
                    ? 'bg-blue-500 animate-pulse' 
                    : 'bg-muted-foreground'
                }`}
              />
              {status === 'CONNECTED'
                ? 'Conectado'
                : status === 'CONNECTING'
                ? 'Aguardando'
                : 'Desconectado'}
            </div>

            {/* Actions for connected */}
            {status !== 'DISCONNECTED' && (
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={refreshStatus} title="Atualizar Status" className="size-8 rounded-full">
                  <RefreshCw className="size-4 text-muted-foreground" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {status === 'CONNECTED' && (
        <div className="flex flex-col border-t border-border/50">
          <div className="p-6 bg-muted/10 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                </div>
                <div>
                  <span className="font-medium text-foreground block">Tudo pronto!</span>
                  Sua conexão está ativa e pronta para enviar mensagens.
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDisconnect} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                Desconectar
              </Button>
          </div>

          <div className="p-6 bg-card border-t border-border/50">
            <h4 className="text-sm font-semibold mb-3">Teste Rápido de Envio</h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Número (Ex: 11999999999)"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                className="max-w-[200px]"
              />
              <Input
                placeholder="Mensagem"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleTestMessage} disabled={testing || !testNumber}>
                {testing ? <Loader2 className="size-4 animate-spin" /> : 'Enviar Teste'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {status === 'CONNECTING' && (
        <div className="bg-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-md pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-sm mx-auto">
            {qrcode ? (
              <div className="space-y-6 flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 transition-all hover:scale-105 duration-500">
                  <img 
                    src={`${qrcode}`} 
                    alt="QR Code WhatsApp" 
                    width={280} 
                    height={280}
                    className="rounded-lg mix-blend-multiply"
                  />
                </div>
                
                <div className="text-center space-y-2">
                  <h4 className="text-lg font-semibold text-foreground">Leia o QR Code</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
                    1. Abra o WhatsApp no seu celular<br/>
                    2. Toque em <strong>Mais opções</strong> ou <strong>Configurações</strong><br/>
                    3. Toque em <strong>Aparelhos conectados</strong><br/>
                    4. Aponte a câmera para a tela
                  </p>
                </div>
                
                <div className="flex w-full gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={handleRefreshQR} 
                    disabled={isRefreshing || loading}
                  >
                    {isRefreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                    Novo QR
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1 gap-2"
                    onClick={handleDisconnect} 
                    disabled={loading}
                  >
                    <Trash2 className="size-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="relative flex items-center justify-center">
                    <Loader2 className="size-12 animate-spin text-emerald-500" />
                    <div className="absolute inset-0 size-12 rounded-full border-4 border-emerald-500/20" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-foreground">Gerando QR Code</h4>
                    <p className="text-sm text-muted-foreground">Conectando com a Evolution API...</p>
                  </div>
                </div>
            )}
          </div>
        </div>
      )}

      {status === 'DISCONNECTED' && (
        <div className="p-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-muted/10">
            <div className="flex items-start gap-3 text-sm text-muted-foreground max-w-md">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                <AlertCircle className="size-4 text-blue-500" />
              </div>
              <p className="leading-relaxed pt-1">
                Conecte seu dispositivo para habilitar o envio de mensagens automáticas pela sua empresa.
              </p>
            </div>
            
            <Button onClick={handleCreateInstance} disabled={loading} className="w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <QrCodeIcon className="size-4" />}
              Conectar Dispositivo
            </Button>
        </div>
      )}
    </div>
  );
}
