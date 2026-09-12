import { notFound } from "next/navigation";
import { captureGrantImpactSnapshot } from "@/app/admin/grant-management-actions";
import {
  AdminPageHeader,
  Notice,
} from "@/components/admin/admin-ui";
import { GrantTabs } from "@/components/admin/grant-tabs";
import { requireSiteAdmin } from "@/lib/admin/auth";

const metrics = [
  ["people_reached", "People reached"],
  ["women_reached", "Women reached"],
  ["men_reached", "Men reached"],
  ["children_reached", "Children reached"],
  ["youth_trained", "Youth trained"],
  ["communities_reached", "Communities reached"],
  ["trainings_conducted", "Trainings conducted"],
  ["livelihoods_supported", "Livelihoods supported"],
] as const;

export default async function GrantImpactPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ snapshot?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireSiteAdmin();

  const { data: grant } = await supabase
    .from("grant_awards")
    .select(
      "id,title,project_id,start_date,end_date,project:projects(title)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!grant) notFound();

  const [
    { data: projectMetrics },
    { data: obligations },
    { data: snapshots },
  ] = await Promise.all([
    grant.project_id
      ? supabase
          .from("project_metrics")
          .select(
            "year,period_start,period_end,district,people_reached,women_reached,men_reached,children_reached,youth_trained,communities_reached,trainings_conducted,livelihoods_supported,published",
          )
          .eq("project_id", grant.project_id)
          .eq("published", true)
          .order("period_start", { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase
      .from("grant_reporting_obligations")
      .select(
        "id,title,report_type,period_start,period_end,due_date",
      )
      .eq("grant_id", id)
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("grant_impact_snapshots")
      .select("*")
      .eq("grant_id", id)
      .order("captured_at", { ascending: false }),
  ]);

  const snapshotMap = new Map(
    (snapshots ?? []).map((snapshot) => [
      snapshot.obligation_id,
      snapshot,
    ]),
  );

  const totals = (projectMetrics ?? []).reduce(
    (sum, row) => {
      for (const [key] of metrics) {
        sum[key] += Number(row[key] || 0);
      }
      return sum;
    },
    Object.fromEntries(
      metrics.map(([key]) => [key, 0]),
    ) as Record<(typeof metrics)[number][0], number>,
  );

  const projectRelation = grant.project as unknown as
    | { title: string }
    | { title: string }[]
    | null;
  const project = Array.isArray(projectRelation)
    ? projectRelation[0] ?? null
    : projectRelation;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Impact Integration"
        title={grant.title}
        description="Reuse published POEM project impact data in donor reporting without duplicate manual entry."
      />
      <GrantTabs grantId={id} active="impact" />

      {query.snapshot ? (
        <Notice>
          Impact snapshot captured from period-specific published project
          metrics.
        </Notice>
      ) : null}
      {query.error ? (
        <Notice tone="error">{query.error}</Notice>
      ) : null}

      {!grant.project_id ? (
        <div className="mt-7">
          <Notice tone="error">
            This grant is not linked to a POEM project. Link a project on
            the Overview tab before using impact integration.
          </Notice>
        </div>
      ) : (
        <>
          <section className="mt-7 rounded-[24px] bg-white p-6 ring-1 ring-black/5">
            <h2 className="font-extrabold text-poem-950">
              Current published project impact
            </h2>
            <p className="mt-2 text-sm text-poem-muted">
              Source: {project?.title || "Linked project"}. Published
              metrics are stored against exact reporting periods.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map(([key, label]) => (
                <div
                  key={key}
                  className="rounded-2xl bg-poem-soft p-4"
                >
                  <p className="text-2xl font-black text-poem-950">
                    {totals[key].toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs font-bold text-poem-muted">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 divide-y divide-black/5 border-t border-black/5">
              {(projectMetrics ?? []).map((metric, index) => (
                <div
                  key={`${metric.period_start}-${metric.period_end}-${index}`}
                  className="flex flex-col justify-between gap-2 py-3 text-xs sm:flex-row sm:items-center"
                >
                  <span className="font-bold text-poem-900">
                    {metric.period_start} → {metric.period_end}
                  </span>
                  <span className="text-poem-muted">
                    {Number(metric.people_reached).toLocaleString()} people
                    {metric.district ? ` · ${metric.district}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-7 rounded-[24px] bg-white p-6 ring-1 ring-black/5">
            <h2 className="font-extrabold text-poem-950">
              Reporting impact snapshots
            </h2>
            <p className="mt-2 text-sm text-poem-muted">
              A donor snapshot only sums published project impact records
              fully contained inside the report period. Annual figures are
              therefore not reused as quarterly figures.
            </p>

            <div className="mt-5 divide-y divide-black/5">
              {(obligations ?? []).map((obligation) => {
                const snapshot = snapshotMap.get(obligation.id);
                const periodStart =
                  obligation.period_start ?? grant.start_date;
                const periodEnd =
                  obligation.period_end ?? grant.end_date;

                return (
                  <div
                    key={obligation.id}
                    className="grid gap-4 py-5 lg:grid-cols-[1fr_auto] lg:items-center"
                  >
                    <div>
                      <p className="font-extrabold text-poem-950">
                        {obligation.title}
                      </p>
                      <p className="mt-1 text-xs capitalize text-poem-muted">
                        {obligation.report_type.replaceAll("_", " ")} ·{" "}
                        {periodStart || "—"} → {periodEnd || "—"}
                      </p>

                      {snapshot ? (
                        <p className="mt-2 text-xs font-bold text-poem-700">
                          Snapshot:{" "}
                          {Number(snapshot.people_reached).toLocaleString()} people
                          {" · "}
                          {Number(snapshot.women_reached).toLocaleString()} women
                          {" · "}
                          {Number(snapshot.communities_reached).toLocaleString()} communities
                          {" · "}
                          {snapshot.source_metric_count} source metric record(s)
                        </p>
                      ) : null}
                    </div>

                    <form action={captureGrantImpactSnapshot}>
                      <input
                        type="hidden"
                        name="grant_id"
                        value={id}
                      />
                      <input
                        type="hidden"
                        name="obligation_id"
                        value={obligation.id}
                      />
                      <button className="rounded-full bg-poem-950 px-5 py-3 text-xs font-extrabold text-white">
                        {snapshot ? "Refresh snapshot" : "Capture snapshot"}
                      </button>
                    </form>
                  </div>
                );
              })}

              {!obligations?.length ? (
                <p className="py-5 text-sm text-poem-muted">
                  Add donor reporting obligations before capturing impact
                  snapshots.
                </p>
              ) : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
