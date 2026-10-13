import { Link, useLocation } from "react-router-dom";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import { breadcrumbLabelKeys } from "@/data/dashboardNav";
import { useLanguage } from "@/hooks/useLanguage";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const location = useLocation();
  const { t } = useLanguage();

  const derivedItems: BreadcrumbItem[] =
    items ??
    (() => {
      const segments = location.pathname.split("/").filter(Boolean);
      let path = "";
      return segments.map((segment, index) => {
        path += `/${segment}`;
        const isLast = index === segments.length - 1;
        return {
          label: breadcrumbLabelKeys[segment] ? t(breadcrumbLabelKeys[segment]) : segment,
          href: isLast ? undefined : path,
        };
      });
    })();

  return (
    <nav aria-label={t("dashboard.breadcrumb")} className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-sm text-terrava-muted">
      {derivedItems.map((item, index) => (
        <span
          key={`${item.label}-${index}`}
          className={index === derivedItems.length - 1 ? "flex min-w-0 items-center gap-1.5" : "flex shrink-0 items-center gap-1.5"}
        >
          {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-terrava-muted/60" aria-hidden="true" />}
          {item.href === "/dashboard" ? (
            // The dashboard root collapses to an icon so the current page keeps the room.
            <Link
              to={item.href}
              aria-label={item.label}
              title={item.label}
              className="grid h-7 w-7 place-items-center rounded-lg transition-colors hover:bg-terrava-bg hover:text-terrava-primary"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : item.href ? (
            <Link to={item.href} className="capitalize transition-colors hover:text-terrava-primary">
              {item.label}
            </Link>
          ) : (
            <span className="truncate font-semibold capitalize text-terrava-text" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
