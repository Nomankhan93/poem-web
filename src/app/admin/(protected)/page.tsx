import Link from "next/link";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import {
  AdminPageHeader,
  StatCard,
} from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireAdmin();

  const [
    { count: projectCount },
    { count: activeProjectCount },
    { count: programCount },
    { count: unreadMessages },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("programs").select("*", { count: "exact", head: true }),
    profile.role === "admin"
      ? supabase
          .from("contact_messages")
          .select("*", { count: "exact", head: true })
          .eq("status", "new")
      : Promise.resolve({ count: 0 }),
  ]);

  const { data: recentProjects } = await supabase
    .from("projects")
    .select("id,title,status,published,updated_at")
    .order("updated_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A focused view of POEM's public content and incoming community inquiries."
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projects"
          value={projectCount ?? 0}
          detail="All projects in the content database"
        />
        <StatCard
          label="Active"
          value={activeProjectCount ?? 0}
          detail="Projects currently marked active"
        />
        <StatCard
          label="Programs"
          value={programCount ?? 0}
          detail="Program areas available to projects"
        />
        <StatCard
          label="New messages"
          value={unreadMessages ?? 0}
          detail={
            profile.role === "admin"
              ? "Unread website inquiries"
              : "Available to admin role"
          }
        />
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-[24px] border border-black/[0.06] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-poem-muted">
                Recent activity
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-poem-950">
                Recently updated projects
              </h2>
            </div>
            <Link
              href="/admin/projects"
              className="text-xs font-extrabold text-poem-700"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 divide-y divide-black/5">
            {(recentProjects ?? []).map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-bold text-poem-950">{project.title}</p>
                  <p className="mt-1 text-xs capitalize text-poem-muted">
                    {project.status}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase ${
                    project.published
                      ? "bg-green-50 text-green-800"
                      : "bg-poem-soft text-poem-muted"
                  }`}
                >
                  {project.published ? "Published" : "Draft"}
                </span>
              </Link>
            ))}

            {!recentProjects?.length ? (
              <p className="py-8 text-sm text-poem-muted">No projects yet.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-[24px] bg-poem-950 p-6 text-white">
          <div className="grid size-11 place-items-center rounded-xl bg-poem-lime text-poem-950">
            <MessageSquare size={19} />
          </div>
          <h2 className="mt-8 text-2xl font-extrabold tracking-[-0.035em]">
            Keep content current.
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/55">
            Publish only verified project details and replace placeholder
            metrics before production launch.
          </p>
        </section>
      </div>
    </div>
  );
}
