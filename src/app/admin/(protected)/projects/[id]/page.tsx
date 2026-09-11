import { notFound } from "next/navigation";
import {
  AdminPageHeader,
  Notice,
} from "@/components/admin/admin-ui";
import { ProjectForm } from "@/components/admin/project-form";
import { requireAdmin } from "@/lib/admin/auth";

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: project }, { data: programs }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id,program_id,slug,title,category,summary,challenge,response,outcomes,status,location,district,province,start_date,end_date,featured,published,project_sdgs(sdg_code)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("programs").select("id,title").order("display_order"),
  ]);

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Projects"
        title="Edit project"
        description={project.title}
      />

      {query.saved ? <Notice>Project saved successfully.</Notice> : null}
      {query.error ? <Notice tone="error">{query.error}</Notice> : null}

      <div className="mt-7">
        <ProjectForm programs={programs ?? []} project={project} />
      </div>
    </div>
  );
}
