import PageHeader from "@/components/ui/page-header";
import AccountContents from "./_account-contents";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  return (
    <>
      <PageHeader title="Account" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <AccountContents accountId={accountId} />
      </div>
    </>
  );
}
