import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { breadcrumbLabels } from "@/data/dashboardNav";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const location = useLocation();

  const derivedItems: BreadcrumbItem[] =
    items ??
    (() => {
      const segments = location.pathname.split("/").filter(Boolean);
      let path = "";
      return segments.map((segment, index) => {
        path += `/${segment}`;
        const isLast = index === segments.length - 1;
        return {
          label: breadcrumbLabels[segment] ?? segment,
          href: isLast ? undefined : path,
        };
      });
    })();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-terrava-muted">
      {derivedItems.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
          {item.href ? (
            <Link to={item.href} className="capitalize transition-colors hover:text-terrava-primary">
              {item.label}
            </Link>
          ) : (
            <span className="capitalize font-medium text-terrava-text">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
