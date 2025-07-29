"use client";

import { usePathname } from "next/navigation";

export function useActivePage() {
	const pathname = usePathname();

	const isActive = (href: string) => {
		// Exact match for root paths
		if (href === "/" || href === "/dashboard") {
			return pathname === href;
		}
		
		// For other paths, check if current path starts with the href
		// This handles nested routes like /accounts/[id] matching /accounts
		return pathname.startsWith(href);
	};

	return { isActive, pathname };
}