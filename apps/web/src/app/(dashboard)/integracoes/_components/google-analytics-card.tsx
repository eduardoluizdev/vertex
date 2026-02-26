'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateGoogleAnalyticsIntegration } from '../_actions/integrations-actions';
import { BarChart3, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface GoogleAnalyticsCardProps {
  initialTrackingId: string;
  isConfigured: boolean;
}

export function GoogleAnalyticsCard({
  initialTrackingId,
  isConfigured: initialIsConfigured,
}: GoogleAnalyticsCardProps) {
  const [trackingId, setTrackingId] = useState(initialTrackingId);
  const [enabled, setEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(initialIsConfigured);

  const handleSave = async () => {
    if (!trackingId.trim() || !trackingId.startsWith('G-')) {
      toast.error('Informe um Tracking ID válido (ex: G-XXXXXXXXXX)');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('trackingId', trackingId.trim());
      formData.append('enabled', String(enabled));

      // Note: passing undefined for companyId because GA is global setting
      const result = await updateGoogleAnalyticsIntegration(undefined, formData);

      if (result.success) {
        toast.success('Configuração salva com sucesso!');
        setIsConfigured(true);
      } else {
        toast.error(result.message || 'Erro ao salvar configuração.');
      }
    } catch (error) {
      toast.error('Erro inesperado ao salvar configuração.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col border-vibe-muted/20 shadow-sm bg-gradient-to-b from-vibe-surface to-background/95">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-foreground/80">
            <BarChart3 className="size-5 text-emerald-500" />
            <h3 className="font-medium">Google Analytics</h3>
          </div>
          {isConfigured ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Conectado
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
              Pendente
            </span>
          )}
        </div>
        <CardDescription className="text-sm">
          Acompanhe o tráfego em todo o sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ga-tracking-id" className="text-xs font-medium text-foreground/80">
            Tracking ID (GA4)
          </Label>
          <Input
            id="ga-tracking-id"
            placeholder="G-XXXXXXXXXX"
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            className="font-mono text-sm bg-background border-vibe-muted/30 focus-visible:ring-emerald-500/20"
          />
          <p className="text-[11px] text-muted-foreground">
            Exemplo: G-HD8DJK7G8V. A tag será injetada em todas as páginas do sistema.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="ga-enabled" className="text-sm text-foreground/80 font-medium cursor-pointer">
            Ativar Tracking
          </Label>
          <Switch
            id="ga-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <Button 
          onClick={handleSave} 
          disabled={isLoading} 
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Configuração'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
