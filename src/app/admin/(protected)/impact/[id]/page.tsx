import { notFound } from "next/navigation";
import {
  AdminPageHeader,
  Notice,
} from "@/components/admin/admin-ui";
import { ImpactForm } from "@/components/admin/impact-form";
import { deleteImpactMetric } from "@/app/admin/impact-actions";
import { requireAdmin } from "@/lib/admin/auth";

export default async function EditImpactPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: metric }, { data: projects }] =
    await Promise.all([
      supabase
        .from("project_metrics")
        .select(
          "id,project_id,year,district,people_reached,women_reached,men_reached,children_reached,youth_trained,communities_reached,trainings_conducted,livelihoods_supported,published",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("projects")
        .select("id,title,district")
        .neq("status", "archived")
        .order("title"),
    ]);

  if (!metric) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Impact"
        title="Edit impact metrics"
        description={`${metric.year}${metric.district ? ` · ${metric.district}` : ""}`}
      />

      {query.saved ? (
        <Notice>Impact metrics saved successfully.</Notice>
      ) : null}
      {query.error ? (
        <Notice tone="error">{query.error}</Notice>
      ) : null}

      <div className="mt-7">
        <ImpactForm
          projects={projects ?? []}
          metric={metric}
        />
      </div>

      <form action={deleteImpactMetric} className="mt-6 text-right">
        <input type="hidden" name="id" value={metric.id} />
        <button
          type="submit"
          className="rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-extrabold text-red-700"
        >
          Delete metric
        </button>
      </form>
    </div>
  );
}
