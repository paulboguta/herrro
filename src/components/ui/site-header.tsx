import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export interface IBreadcrumbItem {
  label: string;
  href?: string;
}

interface SiteHeaderProps {
  breadcrumbs?: IBreadcrumbItem[];
  actions?: ReactNode;
}

function DynamicBreadcrumb({ breadcrumbs }: { breadcrumbs: IBreadcrumbItem[] }) {
  return (
    <>
      {breadcrumbs.length > 0 ? (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <BreadcrumbItem key={index}>
                  {isLast ? (
                    <BreadcrumbPage className="font-medium text-base">{item.label}</BreadcrumbPage>
                  ) : (
                    <>
                      {item.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={item.href} className="font-medium text-base">
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <span className="font-medium text-base text-muted-foreground">{item.label}</span>
                      )}
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                      </BreadcrumbSeparator>
                    </>
                  )}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      ) : (
        <h1 className="font-medium text-base">Dashboard</h1>
      )}
    </>
  );
}

export function SiteHeader({ breadcrumbs = [], actions }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <DynamicBreadcrumb breadcrumbs={breadcrumbs} />
        </div>

        {/* Actions in top right corner */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
