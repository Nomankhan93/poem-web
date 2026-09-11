import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { NewsForm } from "@/components/admin/organization-forms";

export default async function NewNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader eyebrow="News post" title="Create news post" />
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}
      <div className="mt-7"><NewsForm /></div>
    </div>
  );
}
