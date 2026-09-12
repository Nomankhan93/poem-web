import {
  Download,
  Trash2,
} from "lucide-react";
import { notFound } from "next/navigation";
import { deleteGrantReportDocument } from "@/app/admin/grant-management-actions";
import {
  AdminPageHeader,
  Notice,
} from "@/components/admin/admin-ui";
import {
  ReportDocumentForm,
  ReportingObligationForm,
  ReportingStatusForm,
} from "@/components/admin/grant-forms";
import { GrantTabs } from "@/components/admin/grant-tabs";
import { requireSiteAdmin } from "@/lib/admin/auth";
import { computedDeadlineStatus } from "@/lib/grants";
import { createClient } from "@/lib/supabase/server";

export default async function GrantReportingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    report?: string;
    report_updated?: string;
    report_document?: string;
    report_document_deleted?: string;
    error?: string;
  }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireSiteAdmin();

  const [{ data: grant }, { data: obligations }] = await Promise.all([
    supabase
      .from("grant_awards")
      .select("id,title")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("grant_reporting_obligations")
      .select("*")
      .eq("grant_id", id)
      .order("due_date", { ascending: true, nullsFirst: false }),
  ]);

  if (!grant) notFound();

  const ids = (obligations ?? []).map((item) => item.id);
  const { data: documents } = ids.length
    ? await supabase
        .from("grant_report_documents")
        .select("*")
        .in("obligation_id", ids)
        .order("created_at", { ascending: false })
    : { data: [] };

  const docsBy = new Map<string, typeof documents>();
  for (const document of documents ?? []) {
    const list = docsBy.get(document.obligation_id) ?? [];
    list.push(document);
    docsBy.set(document.obligation_id, list);
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Donor Reporting"
        title={grant.title}
        description="Manage donor reporting calendar, submission status, feedback and private report files."
      />
      <GrantTabs grantId={id} active="reporting" />

      {query.report ? <Notice>Reporting obligation added.</Notice> : null}
      {query.report_updated ? (
        <Notice>Reporting status updated.</Notice>
      ) : null}
      {query.report_document ? (
        <Notice>Report document uploaded.</Notice>
      ) : null}
      {query.report_document_deleted ? (
        <Notice>Report document deleted.</Notice>
      ) : null}
      {query.error ? (
        <Notice tone="error">{query.error}</Notice>
      ) : null}

      <section className="mt-7 rounded-[24px] bg-white p-6 ring-1 ring-black/5">
        <h2 className="font-extrabold text-poem-950">
          Add reporting obligation
        </h2>
        <p className="mt-2 text-sm text-poem-muted">
          Set an exact reporting period when this report will use
          project impact data.
        </p>
        <div className="mt-5">
          <ReportingObligationForm grantId={id} />
        </div>
      </section>

      <div className="mt-7 space-y-5">
        {(obligations ?? []).map((obligation) => (
          <ReportCard
            key={obligation.id}
            grantId={id}
            obligation={obligation}
            documents={docsBy.get(obligation.id) ?? []}
          />
        ))}

        {!obligations?.length ? (
          <div className="rounded-[24px] bg-white p-8 text-center text-sm text-poem-muted">
            No donor reporting obligations yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}

async function ReportCard({
  grantId,
  obligation,
  documents,
}: {
  grantId: string;
  obligation: {
    id: string;
    title: string;
    report_type: string;
    period_start: string | null;
    period_end: string | null;
    due_date: string | null;
    responsible_person: string;
    status: string;
    donor_feedback: string;
  };
  documents: Array<{
    id: string;
    title: string;
    document_kind: string;
    storage_path: string;
    size_bytes: number;
  }>;
}) {
  const effectiveStatus = computedDeadlineStatus(
    obligation.due_date,
    obligation.status,
  );
  const supabase = await createClient();

  const signed = await Promise.all(
    documents.map(async (document) => ({
      document,
      url:
        (
          await supabase.storage
            .from("grant-documents")
            .createSignedUrl(document.storage_path, 600)
        ).data?.signedUrl ?? null,
    })),
  );

  return (
    <section className="rounded-[24px] bg-white p-6 ring-1 ring-black/5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-extrabold text-poem-950">
              {obligation.title}
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                effectiveStatus === "overdue"
                  ? "bg-red-50 text-red-700"
                  : "bg-poem-soft text-poem-800"
              }`}
            >
              {effectiveStatus.replaceAll("_", " ")}
            </span>
          </div>

          <p className="mt-2 text-xs capitalize text-poem-muted">
            {obligation.report_type.replaceAll("_", " ")}
            {obligation.due_date
              ? ` · Due ${obligation.due_date}`
              : ""}
            {obligation.responsible_person
              ? ` · ${obligation.responsible_person}`
              : ""}
          </p>

          {obligation.period_start || obligation.period_end ? (
            <p className="mt-1 text-xs text-poem-muted">
              Reporting period: {obligation.period_start || "—"} →{" "}
              {obligation.period_end || "—"}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <ReportingStatusForm
          grantId={grantId}
          obligationId={obligation.id}
          status={obligation.status}
          feedback={obligation.donor_feedback}
        />
      </div>

      {obligation.donor_feedback ? (
        <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Donor feedback:</strong> {obligation.donor_feedback}
        </p>
      ) : null}

      <ReportDocumentForm
        grantId={grantId}
        obligationId={obligation.id}
      />

      {signed.length ? (
        <div className="mt-4 divide-y divide-black/5">
          {signed.map(({ document, url }) => (
            <div
              key={document.id}
              className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
            >
              <div>
                <p className="text-sm font-bold text-poem-950">
                  {document.title}
                </p>
                <p className="mt-1 text-xs capitalize text-poem-muted">
                  {document.document_kind.replaceAll("_", " ")} ·{" "}
                  {(Number(document.size_bytes) / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>

              <div className="flex gap-2">
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-extrabold text-poem-900"
                  >
                    <Download size={14} />
                    Open
                  </a>
                ) : null}

                <form action={deleteGrantReportDocument}>
                  <input
                    type="hidden"
                    name="grant_id"
                    value={grantId}
                  />
                  <input
                    type="hidden"
                    name="obligation_id"
                    value={obligation.id}
                  />
                  <input
                    type="hidden"
                    name="document_id"
                    value={document.id}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-extrabold text-red-700"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
