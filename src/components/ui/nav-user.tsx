"use client";

import {
	CreditCard,
	MoreVertical,
	LogOut,
	Bell,
	UserCircle,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

export function NavUser() {
	const { isMobile } = useSidebar();
	const { user } = useUser();
	const { signOut } = useClerk();

	if (!user) {
		return null;
	}

	const userInitials =
		user.firstName && user.lastName
			? `${user.firstName[0]}${user.lastName[0]}`
			: user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || "U";

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage
									src={user.imageUrl}
									alt={user.fullName || user.emailAddresses[0]?.emailAddress}
								/>
								<AvatarFallback className="rounded-lg">
									{userInitials}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{user.fullName || user.emailAddresses[0]?.emailAddress}
								</span>
								<span className="truncate text-muted-foreground text-xs">
									{user.emailAddresses[0]?.emailAddress}
								</span>
							</div>
							<MoreVertical className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										src={user.imageUrl}
										alt={user.fullName || user.emailAddresses[0]?.emailAddress}
									/>
									<AvatarFallback className="rounded-lg">
										{userInitials}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{user.fullName || user.emailAddresses[0]?.emailAddress}
									</span>
									<span className="truncate text-muted-foreground text-xs">
										{user.emailAddresses[0]?.emailAddress}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<UserCircle />
								Account
							</DropdownMenuItem>
							<DropdownMenuItem>
								<CreditCard />
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Bell />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => signOut()}>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
