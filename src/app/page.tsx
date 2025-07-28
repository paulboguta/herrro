import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-24">
			<div className="max-w-2xl text-center">
				<h1 className="font-bold text-6xl tracking-tight">FinShark</h1>
				<p className="mt-4 text-muted-foreground text-xl">
					Open-source personal finance management with AI-enhanced insights
				</p>
				<div className="mt-8 flex justify-center gap-4">
					<SignedOut>
						<SignInButton mode="modal">
							<Button size="lg">Get Started</Button>
						</SignInButton>
					</SignedOut>
					<SignedIn>
						<Link href="/dashboard">
							<Button size="lg">Go to Dashboard</Button>
						</Link>
					</SignedIn>
				</div>
			</div>
		</div>
	);
}
