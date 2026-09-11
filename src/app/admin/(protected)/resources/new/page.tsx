import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { requireAdmin } from "@/lib/admin/auth";

export default async function NewResourcePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: projects } = await supabase
    .from("projects")
    .select("id,title")
    .neq("status", "archived")
    .order("title");

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Resources"
        title="Create resource"
        description="Upload the PDF, add a cover image if needed, and publish when the document is verified."
      />

      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <div className="mt-7">
        <ResourceForm
          projects={projects ?? []}
          defaultProjectId={params.project}
        />
      </div>
    </div>
  );
}
