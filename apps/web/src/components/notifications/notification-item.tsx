import Link from 'next/link';

import { Bell, Calendar, CreditCard } from 'lucide-react';
import { Notification } from '@/types/notification';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  companyId: string | null;
  className?: string;
}

export function NotificationItem({ notification, companyId, className }: NotificationItemProps) {
  return (
    <Link
      href={companyId ? `/empresas/${companyId}/clientes/${notification.customerId}/editar` : '#'}
      className={cn(
        "flex flex-col gap-2 p-4 hover:bg-muted/50 transition-colors border-b last:border-0",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Bell className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">
              Renovação Próxima
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {notification.daysUntil === 0 
                ? 'Renova hoje' 
                : `Renova em ${notification.daysUntil} dia${notification.daysUntil > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(notification.servicePrice)}
        </div>
      </div>
      
      <div className="pl-10 space-y-1">
         <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="font-medium text-foreground">{notification.serviceName}</span>
            <span>para</span>
            <span className="font-medium text-foreground">{notification.customerName}</span>
         </p>
         <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="size-3" />
            {new Date(notification.renewalDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
         </p>
      </div>
    </Link>
  );
}
