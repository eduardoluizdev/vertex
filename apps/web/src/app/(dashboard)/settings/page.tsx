import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { Bell, Mail, Clock } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Notificações de Email</CardTitle>
            </div>
            <CardDescription>
              Configure quando os emails automáticos são enviados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="expiration-emails" className="font-medium">Avisos de Vencimento</Label>
                <span className="text-sm text-muted-foreground">
                    Enviar emails automaticamente 2 dias antes do vencimento do serviço.
                </span>
              </div>
              <Switch id="expiration-emails" defaultChecked disabled />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                    <Label className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" /> 
                        Horário de Disparo
                    </Label>
                    <span className="text-sm text-muted-foreground">
                        Os emails são processados diariamente às 09:00.
                    </span>
                </div>
                <div className="text-sm font-medium bg-muted px-2 py-1 rounded">
                    09:00 AM
                </div>
            </div>

            <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                    *Para alterar estas configurações, contate o administrador do sistema.
                </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
