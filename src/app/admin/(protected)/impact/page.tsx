import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import {
  AdminPageHeader,
  Notice,
} from "@/components/admin/admin-ui";
import { ImpactForm } from "@/components/admin/impact-form";
import { requireAdmin } from "@/lib/admin/auth";
import {
  emptyImpactTotals,
  formatImpactNumber,
} from "@/lib/impact";

export default async function AdminImpactPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: projects }, { data: metrics }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id,title,district")
        .neq("status", "archived")
        .order("title"),
      supabase
        .from("project_metrics")
        .select(
          "id,project_id,year,district,people_reached,women_reached,men_reached,children_reached,youth_trained,communities_reached,trainings_conducted,livelihoods_supported,published,project:projects(title)",
        )
        .order("year", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

  const published = (metrics ?? []).filter(
    (metric) => metric.published,
  );

  const totals = published.reduce(
    (current, metric) => ({
      peopleReached:
        current.peopleReached +
        Number(metric.people_reached || 0),
      womenReached:
        current.womenReached +
        Number(metric.women_reached || 0),
      menReached:
        current.menReached + Number(metric.men_reached || 0),
      childrenReached:
        current.childrenReached +
        Number(metric.children_reached || 0),
      youthTrained:
        current.youthTrained +
        Number(metric.youth_trained || 0),
      communitiesReached:
        current.communitiesReached +
        Number(metric.communities_reached || 0),
      trainingsConducted:
        current.trainingsConducted +
        Number(metric.trainings_conducted || 0),
      livelihoodsSupported:
        current.livelihoodsSupported +
        Number(metric.livelihoods_supported || 0),
    }),
    emptyImpactTotals,
  );

  const cards = [
    ["People reached", totals.peopleReached],
    ["Women reached", totals.womenReached],
    ["Youth trained", totals.youthTrained],
    ["Communities", totals.communitiesReached],
  ] as const;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Impact"
        title="Verified impact metrics"
        description="Manage project- and year-level results. Only published metrics are visible publicly."
      />

      {params.saved ? <Notice>Impact metrics saved.</Notice> : null}
      {params.deleted ? <Notice>Impact metric deleted.</Notice> : null}
      {params.error ? (
        <Notice tone="error">{params.error}</Notice>
      ) : null}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, amount]) => (
          <div
            key={label}
            className="rounded-[22px] border border-black/[0.06] bg-white p-5"
          >
            <BarChart3 size={18} className="text-poem-700" />
            <p className="mt-5 text-3xl font-black tracking-[-0.04em] text-poem-950">
              {formatImpactNumber(amount)}
            </p>
            <p className="mt-1 text-xs font-bold text-poem-muted">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-7">
        <ImpactForm projects={projects ?? []} />
      </div>

      <section className="mt-7 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white">
        <div className="border-b border-black/5 p-6">
          <h2 className="font-extrabold text-poem-950">
            Recorded metrics
          </h2>
        </div>

        <div className="divide-y divide-black/5">
          {(metrics ?? []).map((metric) => {
            const projectRelation = metric.project as unknown as
              | { title: string }
              | { title: string }[]
              | null;
            const project = Array.isArray(projectRelation)
              ? projectRelation[0] ?? null
              : projectRelation;

            return (
              <Link
                key={metric.id}
                href={`/admin/impact/${metric.id}`}
                className="grid gap-4 p-5 transition hover:bg-poem-soft/60 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-poem-950">
                      {project?.title ?? "Project"}
                    </p>
                    {metric.published ? (
                      <CheckCircle2
                        size={15}
                        className="text-green-700"
                      />
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-poem-muted">
                    {metric.year}
                    {metric.district
                      ? ` · ${metric.district}`
                      : ""}
                    {metric.published
                      ? " · Published"
                      : " · Draft"}
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 text-xs font-extrabold text-poem-800">
                  {formatImpactNumber(
                    Number(metric.people_reached || 0),
                  )}{" "}
                  people
                  <ArrowUpRight size={14} />
                </span>
              </Link>
            );
          })}

          {!metrics?.length ? (
            <p className="p-7 text-center text-sm text-poem-muted">
              No impact metrics have been recorded yet.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
