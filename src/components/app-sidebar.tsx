"use client";

import { Banknote, CreditCard, Home } from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const isActive = (url: string) => pathname === url;

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
        isActive: isActive("/"),
      },
      {
        title: "Accounts",
        url: "/accounts",
        icon: Banknote,
        isActive: isActive("/accounts"),
      },
      {
        title: "Transactions",
        url: "/transactions",
        icon: CreditCard,
        isActive: isActive("/transactions"),
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
