'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationList } from './notification-list';
import { getExpiringNotifications } from '@/actions/notifications';
import { Notification } from '@/types/notification';
import { toast } from 'sonner';

interface NotificationBellProps {
  companyId: string | null;
}

export function NotificationBell({ companyId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const data = await getExpiringNotifications(companyId);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when companyId changes
  useEffect(() => {
    fetchNotifications();
    
    // Optional: Poll every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [companyId]);

  // Refetch when opening the menu to ensure fresh data
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchNotifications();
    }
  };

  const unreadCount = notifications.length;

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center text-[10px] rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading && notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : (
          <NotificationList notifications={notifications} companyId={companyId} />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
