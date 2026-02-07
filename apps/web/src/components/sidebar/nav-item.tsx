'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: string | number;
  isActive?: boolean;
  collapsed?: boolean;
}

export function NavItem({
  href,
  icon: Icon,
  label,
  badge,
  isActive,
  collapsed,
}: NavItemProps) {
  const content = (
    <Link
      href={href}
      className={`flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
        collapsed ? 'justify-center px-0' : 'gap-3 px-3'
      } ${
        isActive
          ? 'bg-primary/10 text-primary shadow-sm'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      }`}
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
