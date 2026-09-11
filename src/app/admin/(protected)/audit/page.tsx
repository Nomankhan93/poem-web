import {
  Activity,
  Database,
} from "lucide-react";
import {
  AdminPageHeader,
  Notice,
} from "@/components/admin/admin-ui";
import { requireSiteAdmin } from "@/lib/admin/auth";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSiteAdmin();

  const { data: events, error } = await supabase
    .from("content_audit_log")
    .select(
      "id,actor_id,table_name,operation,record_id,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Security"
        title="Content audit log"
        description="Recent create, update and delete events across POEM content tables. Sensitive field values are not copied into this log."
      />

      {params.error ? (
        <Notice tone="error">{params.error}</Notice>
      ) : null}

      {error ? (
        <div className="mt-6">
          <Notice tone="error">
            Audit log could not be loaded: {error.message}
          </Notice>
        </div>
      ) : null}

      <section className="mt-7 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white">
        <div className="flex items-center gap-3 border-b border-black/5 p-6">
          <div className="grid size-11 place-items-center rounded-xl bg-poem-soft text-poem-900">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="font-extrabold text-poem-950">
              Latest events
            </h2>
            <p className="text-xs text-poem-muted">
              Showing up to 100 events
            </p>
          </div>
        </div>

        <div className="divide-y divide-black/5">
          {(events ?? []).map((event) => (
            <article
              key={event.id}
              className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-poem-soft text-poem-800">
                  <Database size={15} />
                </div>

                <div>
                  <p className="font-extrabold text-poem-950">
                    {event.operation} · {event.table_name}
                  </p>
                  <p className="mt-1 text-xs text-poem-muted">
                    Record: {event.record_id || "n/a"}
                  </p>
                  <p className="mt-1 text-xs text-poem-muted">
                    Actor: {event.actor_id || "system"}
                  </p>
                </div>
              </div>

              <time className="text-xs font-bold text-poem-muted">
                {new Date(event.created_at).toLocaleString()}
              </time>
            </article>
          ))}

          {!events?.length && !error ? (
            <p className="p-8 text-center text-sm text-poem-muted">
              No audited content changes have been recorded yet.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
