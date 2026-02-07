import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {/* Home icon */}
      <Link
        href="/"
        className="text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Home"
      >
        <Home className="size-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;

        return (
          <Fragment key={index}>
            <ChevronRight className="size-4 text-muted-foreground/50" />
            
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="flex items-center gap-1.5">
                  {Icon && <Icon className="size-3.5" />}
                  {item.label}
                </span>
              </Link>
            ) : (
              <span
                className={`flex items-center gap-1.5 ${
                  isLast ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}
              >
                {Icon && <Icon className="size-3.5" />}
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
