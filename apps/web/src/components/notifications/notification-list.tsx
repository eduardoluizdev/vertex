import { Notification } from '@/types/notification';
import { NotificationItem } from './notification-item';
import { BellOff } from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  companyId: string | null;
}

export function NotificationList({ notifications, companyId }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-muted-foreground text-center">
        <BellOff className="size-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">Nenhuma notificação</p>
        <p className="text-xs">Você não tem notificações pendentes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[300px] overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          companyId={companyId} 
        />
      ))}
    </div>
  );
}
