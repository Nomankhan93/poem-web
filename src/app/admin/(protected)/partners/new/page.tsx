import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { PartnerForm } from "@/components/admin/organization-forms";

export default async function NewPartnerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader eyebrow="Partner" title="Create partner" />
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}
      <div className="mt-7"><PartnerForm /></div>
    </div>
  );
}
