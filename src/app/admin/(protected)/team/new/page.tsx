import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { TeamForm } from "@/components/admin/organization-forms";

export default async function NewTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader eyebrow="Team member" title="Create team member" />
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}
      <div className="mt-7"><TeamForm /></div>
    </div>
  );
}
