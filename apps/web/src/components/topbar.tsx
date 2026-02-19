import { NotificationBell } from '@/components/notifications/notification-bell';
import { Separator } from '@/components/ui/separator';

interface TopbarProps {
  selectedCompanyId: string | null;
}

export function Topbar({ selectedCompanyId }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6 shadow-sm">
      <div className="flex-1">
        {/* Placeholder for Breadcrumbs or Page Title */}
        {/* <h1 className="text-lg font-semibold">Dashboard</h1> */}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
           <NotificationBell companyId={selectedCompanyId} />
        </div>
      </div>
    </header>
  );
}
