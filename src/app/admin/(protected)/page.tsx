import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  BookOpenText,
  FileText,
  FolderKanban,
  MessageSquare,
  Newspaper,
  UsersRound,
} from "lucide-react";
import {
  AdminPageHeader,
  Notice,
} from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await requireAdmin();

  const [
    projects,
    resources,
    stories,
    news,
    messages,
    metrics,
    users,
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("resources")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("stories")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("news_posts")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("project_metrics")
      .select("*", { count: "exact", head: true })
      .eq("published", true),
    profile.role === "super_admin"
      ? supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
      : Promise.resolve({ count: null }),
  ]);

  const cards = [
    {
      label: "Projects",
      value: projects.count ?? 0,
      href: "/admin/projects",
      icon: FolderKanban,
    },
    {
      label: "Resources",
      value: resources.count ?? 0,
      href: "/admin/resources",
      icon: FileText,
    },
    {
      label: "Stories",
      value: stories.count ?? 0,
      href: "/admin/stories",
      icon: BookOpenText,
    },
    {
      label: "News posts",
      value: news.count ?? 0,
      href: "/admin/news",
      icon: Newspaper,
    },
    {
      label: "New messages",
      value: messages.count ?? 0,
      href: "/admin/messages",
      icon: MessageSquare,
    },
    {
      label: "Published metrics",
      value: metrics.count ?? 0,
      href: "/admin/impact",
      icon: BarChart3,
    },
  ];

  if (profile.role === "super_admin") {
    cards.push({
      label: "Staff accounts",
      value: users.count ?? 0,
      href: "/admin/users",
      icon: UsersRound,
    });
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title="POEM administration"
        description="Manage public content, verified impact data and organization operations from one workspace."
      />

      {params.error ? (
        <Notice tone="error">{params.error}</Notice>
      ) : null}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-[24px] border border-black/[0.06] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="grid size-11 place-items-center rounded-xl bg-poem-soft text-poem-900">
                <Icon size={18} />
              </div>
              <ArrowUpRight
                size={16}
                className="text-poem-muted transition group-hover:text-poem-900"
              />
            </div>
            <p className="mt-7 text-4xl font-black tracking-[-0.05em] text-poem-950">
              {value}
            </p>
            <p className="mt-2 text-sm font-bold text-poem-muted">
              {label}
            </p>
          </Link>
        ))}
      </div>

      <section className="mt-7 rounded-[24px] bg-poem-950 p-7 text-white">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-poem-lime">
          Access level
        </p>
        <h2 className="mt-3 text-2xl font-extrabold">
          {profile.role.replace("_", " ")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
          Super Admin manages staff access and roles. Admin manages
          organization settings and content. Editors manage content and
          impact records without user-access controls.
        </p>
      </section>
    </div>
  );
}
