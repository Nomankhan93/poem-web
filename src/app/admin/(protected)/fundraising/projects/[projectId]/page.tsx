import { notFound } from "next/navigation";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { ProjectFundingForm } from "@/components/admin/public-fundraising-forms";
import { requireSiteAdmin } from "@/lib/admin/auth";

export default async function ProjectFundingEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { projectId } = await params;
  const query = await searchParams;
  const { supabase } = await requireSiteAdmin();

  const [{ data: project }, { data: profile }] = await Promise.all([
    supabase
      .from("projects")
      .select("id,slug,title")
      .eq("id", projectId)
      .maybeSingle(),
    supabase
      .from("project_funding_profiles")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle(),
  ]);

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Fundraising"
        title="Project funding profile"
        description={project.title}
      />
      {query.saved ? <Notice>Project funding profile saved.</Notice> : null}
      {query.error ? <Notice tone="error">{query.error}</Notice> : null}
      <div className="mt-7">
        <ProjectFundingForm project={project} profile={profile} />
      </div>
    </div>
  );
}
