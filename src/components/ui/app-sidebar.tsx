"use client";

import type * as React from "react";
import {
	LayoutDashboard,
	Receipt,
	Settings,
	PiggyBank,
	Landmark,
} from "lucide-react";

import { NavMain } from "@/components/ui/nav-main";
import { NavSecondary } from "@/components/ui/nav-secondary";
import { NavUser } from "@/components/ui/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: LayoutDashboard,
		},
		{
			title: "Accounts",
			url: "/accounts",
			icon: Landmark,
		},
		{
			title: "Transactions",
			url: "/transactions",
			icon: Receipt,
		},
	],
	// navClouds: [
	//   {
	//     title: "Budget",
	//     icon: IconWallet,
	//     isActive: true,
	//     url: "/dashboard/budget",
	//     items: [
	//       {
	//         title: "Monthly Budget",
	//         url: "/dashboard/budget/monthly",
	//       },
	//       {
	//         title: "Categories",
	//         url: "/dashboard/budget/categories",
	//       },
	//     ],
	//   },
	//   {
	//     title: "Goals",
	//     icon: IconTargetArrow,
	//     url: "/dashboard/goals",
	//     items: [
	//       {
	//         title: "Savings Goals",
	//         url: "/dashboard/goals/savings",
	//       },
	//       {
	//         title: "Debt Payoff",
	//         url: "/dashboard/goals/debt",
	//       },
	//     ],
	//   },
	//   {
	//     title: "Credit Cards",
	//     icon: IconCreditCard,
	//     url: "/dashboard/credit-cards",
	//     items: [
	//       {
	//         title: "Active Cards",
	//         url: "/dashboard/credit-cards/active",
	//       },
	//       {
	//         title: "Payment Schedule",
	//         url: "/dashboard/credit-cards/payments",
	//       },
	//     ],
	//   },
	// ],
	navSecondary: [
		{
			title: "Settings",
			url: "/dashboard/settings",
			icon: Settings,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="/dashboard">
								<PiggyBank className="!size-5" />
								<span className="font-semibold text-base">FinShark</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
