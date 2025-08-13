import { Card } from "@/components/ui/card";
import PageHeader from "@/components/ui/page-header";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <PageHeader title="Home" />
      <div className="flex flex-1 flex-col gap-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Card className="aspect-video rounded-xl" />
          <Card className="aspect-video rounded-xl" />
          <Card className="aspect-video rounded-xl" />
        </div>
        <Card className="min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
    </HydrateClient>
  );
}
