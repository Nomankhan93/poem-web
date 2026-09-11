import Link from "next/link";
import { Archive, ArrowUpRight, MapPin } from "lucide-react";
import { archiveProject } from "@/app/admin/actions";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: projects } = await supabase
    .from("projects")
    .select("id,title,slug,status,location,published,featured,updated_at")
    .neq("status", "archived")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Projects"
        description="Create, edit, publish and archive POEM project pages."
        action={
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white"
          >
            New project
            <ArrowUpRight size={16} />
          </Link>
        }
      />

      {params.archived ? <Notice>Project archived.</Notice> : null}
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <div className="mt-7 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white">
        <div className="hidden grid-cols-[1.6fr_.7fr_.6fr_auto] gap-4 border-b border-black/5 px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-poem-muted md:grid">
          <span>Project</span>
          <span>Status</span>
          <span>Visibility</span>
          <span>Actions</span>
        </div>

        <div className="divide-y divide-black/5">
          {(projects ?? []).map((project) => (
            <div
              key={project.id}
              className="grid gap-4 px-5 py-5 md:grid-cols-[1.6fr_.7fr_.6fr_auto] md:items-center md:px-6"
            >
              <div>
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="font-extrabold text-poem-950 hover:text-poem-700"
                >
                  {project.title}
                </Link>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-poem-muted">
                  <MapPin size={12} />
                  {project.location || "Location not set"}
                </p>
              </div>

              <span className="w-fit rounded-full bg-poem-soft px-3 py-1.5 text-[10px] font-extrabold uppercase capitalize text-poem-800">
                {project.status}
              </span>

              <span
                className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase ${
                  project.published
                    ? "bg-green-50 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {project.published ? "Published" : "Draft"}
              </span>

              <div className="flex gap-2">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="rounded-full border border-black/10 px-4 py-2 text-xs font-extrabold text-poem-900"
                >
                  Edit
                </Link>
                <form action={archiveProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <button
                    type="submit"
                    title="Archive project"
                    className="grid size-9 place-items-center rounded-full border border-black/10 text-poem-muted hover:text-red-700"
                  >
                    <Archive size={15} />
                  </button>
                </form>
              </div>
            </div>
          ))}

          {!projects?.length ? (
            <div className="px-6 py-12 text-center text-sm text-poem-muted">
              No projects found. Create your first project.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
