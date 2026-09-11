import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { TenderForm } from "@/components/admin/organization-forms";

export default async function NewTenderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader eyebrow="Tender" title="Create tender" />
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}
      <div className="mt-7"><TenderForm /></div>
    </div>
  );
}
