import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { CareerForm } from "@/components/admin/organization-forms";

export default async function NewCareerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader eyebrow="Vacancy" title="Create vacancy" />
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}
      <div className="mt-7"><CareerForm /></div>
    </div>
  );
}
