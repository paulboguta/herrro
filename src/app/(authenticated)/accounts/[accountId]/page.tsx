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
      <AccountContents accountId={accountId} />
    </>
  );
}
