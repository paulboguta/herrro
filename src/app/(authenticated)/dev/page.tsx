import PageHeader from "@/components/ui/page-header";
import { env } from "@/env";
import { redirect } from "next/navigation";
import { DevContents } from "./_dev-contents";

export default function Dev() {
  if (env.NODE_ENV !== "development") {
    return redirect("/");
  }

  return (
    <>
      <PageHeader title="Dev" />
      <DevContents />
    </>
  );
}
