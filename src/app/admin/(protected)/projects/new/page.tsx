import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { ProjectForm } from "@/components/admin/project-form";
import { requireAdmin } from "@/lib/admin/auth";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: programs } = await supabase
    .from("programs")
    .select("id,title")
    .order("display_order");

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Projects"
        title="Create project"
        description="Create the project record first; images, reports and advanced metrics arrive in the next content/media phase."
      />

      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <div className="mt-7">
        <ProjectForm programs={programs ?? []} />
      </div>
    </div>
  );
}
