import { AccountManager } from "@/app/_components/account";
import { HydrateClient, api } from "@/trpc/server";

export default async function Home() {
	void api.account.getAll.prefetch();

	return (
		<HydrateClient>
			<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
					<h1 className="font-extrabold text-5xl tracking-tight sm:text-[5rem]">
						<span className="text-[hsl(280,100%,70%)]">Financial</span> Accounts
					</h1>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
					</div>
					<AccountManager />
				</div>
			</main>
		</HydrateClient>
	);
}
