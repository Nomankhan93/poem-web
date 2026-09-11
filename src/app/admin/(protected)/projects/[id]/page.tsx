import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { ProjectForm } from "@/components/admin/project-form";
import { ProjectMediaManager } from "@/components/admin/project-media-manager";
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

  const [
    { data: project },
    { data: programs },
    { data: stories },
    { data: media },
    { data: reports },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id,program_id,featured_story_id,slug,title,category,donor_partner,summary,challenge,response,outcomes,status,location,district,province,start_date,end_date,featured,published,project_sdgs(sdg_code)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("programs").select("id,title").order("display_order"),
    supabase.from("stories").select("id,title").eq("published", true).order("title"),
    supabase
      .from("project_media")
      .select("id,role,display_order,media_assets(id,bucket,path,file_name,alt_text,caption)")
      .eq("project_id", id)
      .order("display_order"),
    supabase
      .from("resources")
      .select("id,title,category,year,published")
      .eq("project_id", id)
      .order("year", { ascending: false }),
  ]);

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Projects"
        title="Edit project"
        description={project.title}
        action={
          <Link
            href={`/projects/${project.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-poem-900"
          >
            Public page
            <ArrowUpRight size={15} />
          </Link>
        }
      />

      {query.saved ? <Notice>Project saved successfully.</Notice> : null}
      {query.error ? <Notice tone="error">{query.error}</Notice> : null}

      <div className="mt-7 space-y-6">
        <ProjectForm
          programs={programs ?? []}
          stories={stories ?? []}
          project={project}
        />

        <ProjectMediaManager
          projectId={project.id}
          media={(media ?? []) as never[]}
        />

        <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-extrabold text-poem-950">
                Project reports
              </h2>
              <p className="mt-2 text-sm text-poem-muted">
                Link reports and publications to this project from Resources.
              </p>
            </div>

            <Link
              href={`/admin/resources/new?project=${project.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-poem-soft px-4 py-2.5 text-xs font-extrabold text-poem-900"
            >
              Add project resource
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mt-5 divide-y divide-black/5">
            {(reports ?? []).map((report) => (
              <Link
                key={report.id}
                href={`/admin/resources/${report.id}`}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="text-sm font-extrabold text-poem-950">
                    {report.title}
                  </p>
                  <p className="mt-1 text-xs text-poem-muted">
                    {report.category} · {report.year}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-[9px] font-extrabold uppercase ${
                    report.published
                      ? "bg-green-50 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {report.published ? "Published" : "Draft"}
                </span>
              </Link>
            ))}

            {!reports?.length ? (
              <p className="py-5 text-sm text-poem-muted">
                No resources linked to this project yet.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
