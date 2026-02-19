import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Calendar, CalendarCheck } from 'lucide-react';
import { getSelectedCompanyId } from '@/lib/cookies';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ExpiringService = {
  id: string;
  customerName: string;
  customerId: string;
  serviceName: string;
  servicePrice: number;
  renewalDate: string;
  daysUntil: number;
};

export async function ExpiringServicesWidget() {
  const companyId = await getSelectedCompanyId();
  if (!companyId) return null;

  const response = await apiClient('/v1/notifications/expiring', {
     headers: {
        'x-company-id': companyId
     }
  });

  if (!response.ok) {
    return null; // Silent fail or empty state
  }

  const services: ExpiringService[] = await response.json();

  if (services.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
       <Card className="border-l-4 border-l-amber-500 shadow-md">
         <CardHeader className="pb-3">
           <CardTitle className="flex items-center gap-2 text-lg font-semibold text-amber-700 dark:text-amber-500">
             <AlertCircle className="h-5 w-5" />
             Renovações Próximas
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {services.map((service) => (
               <div
                 key={service.id}
                 className="flex flex-col gap-2 rounded-lg border bg-card p-4 transition-all hover:bg-accent hover:text-accent-foreground"
               >
                 <div className="flex justify-between items-start">
                   <div className="font-semibold">{service.customerName}</div>
                   <div className="text-xs font-medium px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                     {service.daysUntil === 1 ? 'Amanhã' : 'Em 2 dias'}
                   </div>
                 </div>
                 
                 <div className="text-sm text-muted-foreground">
                   {service.serviceName}
                 </div>
                 
                 <div className="mt-2 flex items-center justify-between text-sm">
                   <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(service.renewalDate), "dd 'de' MMM", { locale: ptBR })}</span>
                   </div>
                   <div className="font-medium">
                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.servicePrice)}
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
    </div>
  );
}
