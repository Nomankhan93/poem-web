"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSiteAdmin } from "@/lib/admin/auth";
import { moneyValue } from "@/lib/grants";

function value(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function nullable(form: FormData, key: string) {
  return value(form, key) || null;
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function saveGrantAward(formData: FormData) {
  const { supabase } = await requireSiteAdmin();
  const id = value(formData, "id");
  const base = "/admin/fundraising/grants";
  const path = id ? `${base}/${id}` : `${base}/new`;
  const applicationId = nullable(formData, "application_id");

  let application: {
    title: string;
    donor_id: string | null;
    project_id: string | null;
    program_id: string | null;
    requested_amount: number | null;
    currency: string;
  } | null = null;

  if (applicationId) {
    const { data, error } = await supabase
      .from("grant_applications")
      .select(
        "title,donor_id,project_id,program_id,requested_amount,currency",
      )
      .eq("id", applicationId)
      .maybeSingle();

    if (error) fail(path, error.message);
    if (!data) fail(path, "Selected grant application was not found.");
    application = data;
  }

  const awardAmount = moneyValue(formData.get("award_amount"));
  const payload = {
    application_id: applicationId,
    donor_id:
      nullable(formData, "donor_id") ?? application?.donor_id ?? null,
    project_id:
      nullable(formData, "project_id") ??
      application?.project_id ??
      null,
    program_id:
      nullable(formData, "program_id") ??
      application?.program_id ??
      null,
    title: value(formData, "title") || application?.title || "",
    award_number: value(formData, "award_number"),
    status: value(formData, "status") || "awarded",
    award_amount: awardAmount ?? application?.requested_amount ?? null,
    currency:
      value(formData, "currency") || application?.currency || "USD",
    award_date: nullable(formData, "award_date"),
    start_date: nullable(formData, "start_date"),
    end_date: nullable(formData, "end_date"),
    grant_manager: value(formData, "grant_manager"),
    notes: value(formData, "notes"),
  };

  if (!payload.title) fail(path, "Grant title is required.");
  if (payload.award_amount === null) {
    fail(path, "Award amount is required.");
  }
  if (
    payload.start_date &&
    payload.end_date &&
    payload.end_date < payload.start_date
  ) {
    fail(path, "Grant end date cannot be before start date.");
  }

  if (id) {
    const { error } = await supabase
      .from("grant_awards")
      .update(payload)
      .eq("id", id);

    if (error) fail(path, error.message);

    revalidatePath(base);
    revalidatePath(path);
    redirect(`${path}?saved=1`);
  }

  const { data: createdGrantId, error } = await supabase.rpc(
    "create_grant_award_atomic",
    {
      p_application_id: payload.application_id,
      p_donor_id: payload.donor_id,
      p_project_id: payload.project_id,
      p_program_id: payload.program_id,
      p_title: payload.title,
      p_award_number: payload.award_number,
      p_status: payload.status,
      p_award_amount: payload.award_amount,
      p_currency: payload.currency,
      p_award_date: payload.award_date,
      p_start_date: payload.start_date,
      p_end_date: payload.end_date,
      p_grant_manager: payload.grant_manager,
      p_notes: payload.notes,
    },
  );

  if (error || !createdGrantId) {
    fail(
      path,
      error?.message ?? "Could not create grant award.",
    );
  }

  revalidatePath("/admin/fundraising");
  revalidatePath("/admin/fundraising/applications");
  revalidatePath(base);
  redirect(`${base}/${String(createdGrantId)}?created=1`);
}

export async function deleteGrantAgreement(formData: FormData) {
  const { supabase } = await requireSiteAdmin();
  const grantId = value(formData, "grant_id");
  const agreementId = value(formData, "agreement_id");
  const path = `/admin/fundraising/grants/${grantId}`;

  const { data, error: lookupError } = await supabase
    .from("grant_agreements")
    .select("storage_path")
    .eq("id", agreementId)
    .eq("grant_id", grantId)
    .maybeSingle();

  if (lookupError) fail(path, lookupError.message);
  if (!data) fail(path, "Agreement not found.");

  if (data.storage_path) {
    const { error: storageError } = await supabase.storage
      .from("grant-documents")
      .remove([data.storage_path]);

    if (storageError) fail(path, storageError.message);
  }

  const { error } = await supabase
    .from("grant_agreements")
    .delete()
    .eq("id", agreementId)
    .eq("grant_id", grantId);

  if (error) fail(path, error.message);

  revalidatePath(path);
  redirect(`${path}?agreement_deleted=1`);
}

export async function addGrantInstallment(formData: FormData) {
  const { supabase } = await requireSiteAdmin();
  const grantId = value(formData, "grant_id");
  const path = `/admin/fundraising/grants/${grantId}/finance`;
  const amount = moneyValue(formData.get("expected_amount"));
  const number = Number(value(formData, "installment_number"));
  const expectedDate = nullable(formData, "expected_date");

  if (!Number.isInteger(number) || number < 1) {
    fail(path, "Installment number must be a positive integer.");
  }
  if (amount === null) {
    fail(path, "Expected installment amount is required.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const status =
    expectedDate && expectedDate < today ? "overdue" : "planned";

  const { error } = await supabase.from("grant_installments").insert({
    grant_id: grantId,
    installment_number: number,
    label: value(formData, "label"),
    expected_amount: amount,
    expected_date: expectedDate,
    status,
    notes: value(formData, "notes"),
  });

  if (error) fail(path, error.message);

  revalidatePath(path);
  redirect(`${path}?installment=1`);
}

export async function addFundReceipt(formData: FormData) {
  const { supabase, user } = await requireSiteAdmin();
  const grantId = value(formData, "grant_id");
  const path = `/admin/fundraising/grants/${grantId}/finance`;
  const amount = moneyValue(formData.get("amount"));
  const installmentId = nullable(formData, "installment_id");

  if (amount === null || amount <= 0) {
    fail(path, "Received amount must be greater than zero.");
  }

  const { data: grant, error: grantError } = await supabase
    .from("grant_awards")
    .select("currency")
    .eq("id", grantId)
    .maybeSingle();

  if (grantError || !grant) {
    fail(path, grantError?.message ?? "Grant not found.");
  }

  if (installmentId) {
    const { data: installment, error: installmentError } = await supabase
      .from("grant_installments")
      .select("id")
      .eq("id", installmentId)
      .eq("grant_id", grantId)
      .maybeSingle();

    if (installmentError || !installment) {
      fail(
        path,
        installmentError?.message ??
          "Selected installment does not belong to this grant.",
      );
    }
  }

  const { error } = await supabase.from("grant_fund_receipts").insert({
    grant_id: grantId,
    installment_id: installmentId,
    amount,
    currency: grant.currency,
    received_date:
      value(formData, "received_date") ||
      new Date().toISOString().slice(0, 10),
    reference_number: value(formData, "reference_number"),
    bank_reference: value(formData, "bank_reference"),
    notes: value(formData, "notes"),
    created_by: user.id,
  });

  if (error) fail(path, error.message);

  revalidatePath("/admin/fundraising");
  revalidatePath(path);
  redirect(`${path}?receipt=1`);
}

export async function addReportingObligation(formData: FormData) {
  const { supabase, user } = await requireSiteAdmin();
  const grantId = value(formData, "grant_id");
  const path = `/admin/fundraising/grants/${grantId}/reporting`;
  const periodStart = nullable(formData, "period_start");
  const periodEnd = nullable(formData, "period_end");

  if (periodStart && periodEnd && periodEnd < periodStart) {
    fail(path, "Reporting period end cannot be before start date.");
  }

  const payload = {
    grant_id: grantId,
    report_type: value(formData, "report_type") || "narrative",
    title: value(formData, "title"),
    period_start: periodStart,
    period_end: periodEnd,
    due_date: nullable(formData, "due_date"),
    responsible_person: value(formData, "responsible_person"),
    status: value(formData, "status") || "not_started",
    notes: value(formData, "notes"),
    created_by: user.id,
  };

  if (!payload.title) fail(path, "Report title is required.");

  const { error } = await supabase
    .from("grant_reporting_obligations")
    .insert(payload);

  if (error) fail(path, error.message);

  revalidatePath("/admin/fundraising/reporting");
  revalidatePath(path);
  redirect(`${path}?report=1`);
}

export async function updateReportingObligation(formData: FormData) {
  const { supabase } = await requireSiteAdmin();
  const grantId = value(formData, "grant_id");
  const obligationId = value(formData, "obligation_id");
  const path = `/admin/fundraising/grants/${grantId}/reporting`;
  const status = value(formData, "status");
  const today = new Date().toISOString().slice(0, 10);

  const payload: Record<string, string | null> = {
    status,
    donor_feedback: value(formData, "donor_feedback"),
  };

  if (status === "submitted") {
    payload.submitted_at =
      nullable(formData, "submitted_at") ?? today;
  }

  if (status === "accepted") {
    payload.accepted_at =
      nullable(formData, "accepted_at") ?? today;
  }

  const { error } = await supabase
    .from("grant_reporting_obligations")
    .update(payload)
    .eq("id", obligationId)
    .eq("grant_id", grantId);

  if (error) fail(path, error.message);

  revalidatePath("/admin/fundraising/reporting");
  revalidatePath(path);
  redirect(`${path}?report_updated=1`);
}

export async function deleteGrantReportDocument(formData: FormData) {
  const { supabase } = await requireSiteAdmin();
  const grantId = value(formData, "grant_id");
  const obligationId = value(formData, "obligation_id");
  const documentId = value(formData, "document_id");
  const path = `/admin/fundraising/grants/${grantId}/reporting`;

  const [
    { data: document, error: lookupError },
    { data: obligation, error: obligationError },
  ] = await Promise.all([
    supabase
      .from("grant_report_documents")
      .select("storage_path")
      .eq("id", documentId)
      .eq("obligation_id", obligationId)
      .maybeSingle(),
    supabase
      .from("grant_reporting_obligations")
      .select("id")
      .eq("id", obligationId)
      .eq("grant_id", grantId)
      .maybeSingle(),
  ]);

  if (lookupError || !document) {
    fail(path, lookupError?.message ?? "Report document not found.");
  }

  if (obligationError || !obligation) {
    fail(
      path,
      obligationError?.message ??
        "Report document does not belong to this grant.",
    );
  }

  const { error: storageError } = await supabase.storage
    .from("grant-documents")
    .remove([document.storage_path]);

  if (storageError) fail(path, storageError.message);

  const { error } = await supabase
    .from("grant_report_documents")
    .delete()
    .eq("id", documentId)
    .eq("obligation_id", obligationId);

  if (error) fail(path, error.message);

  revalidatePath(path);
  redirect(`${path}?report_document_deleted=1`);
}

export async function captureGrantImpactSnapshot(formData: FormData) {
  const { supabase, user } = await requireSiteAdmin();
  const grantId = value(formData, "grant_id");
  const obligationId = value(formData, "obligation_id");
  const path = `/admin/fundraising/grants/${grantId}/impact`;

  const [
    { data: grant, error: grantError },
    { data: obligation, error: reportError },
  ] = await Promise.all([
    supabase
      .from("grant_awards")
      .select("project_id,start_date,end_date")
      .eq("id", grantId)
      .maybeSingle(),
    supabase
      .from("grant_reporting_obligations")
      .select("period_start,period_end")
      .eq("id", obligationId)
      .eq("grant_id", grantId)
      .maybeSingle(),
  ]);

  if (grantError || !grant) {
    fail(path, grantError?.message ?? "Grant not found.");
  }
  if (reportError || !obligation) {
    fail(path, reportError?.message ?? "Reporting obligation not found.");
  }
  if (!grant.project_id) {
    fail(
      path,
      "Link this grant to a POEM project before capturing impact.",
    );
  }

  const periodStart = obligation.period_start ?? grant.start_date;
  const periodEnd = obligation.period_end ?? grant.end_date;

  if (!periodStart || !periodEnd) {
    fail(
      path,
      "Set a reporting period (or grant start/end dates) before capturing impact.",
    );
  }

  const { data: metrics, error: metricsError } = await supabase
    .from("project_metrics")
    .select(
      "period_start,period_end,people_reached,women_reached,men_reached,children_reached,youth_trained,communities_reached,trainings_conducted,livelihoods_supported",
    )
    .eq("project_id", grant.project_id)
    .eq("published", true)
    .gte("period_start", periodStart)
    .lte("period_end", periodEnd)
    .order("period_start");

  if (metricsError) fail(path, metricsError.message);

  if (!metrics?.length) {
    fail(
      path,
      "No published project impact records fall fully within this donor reporting period. Add period-specific verified impact data first.",
    );
  }

  const totals = metrics.reduce(
    (sum, row) => ({
      people_reached:
        sum.people_reached + Number(row.people_reached || 0),
      women_reached:
        sum.women_reached + Number(row.women_reached || 0),
      men_reached: sum.men_reached + Number(row.men_reached || 0),
      children_reached:
        sum.children_reached + Number(row.children_reached || 0),
      youth_trained:
        sum.youth_trained + Number(row.youth_trained || 0),
      communities_reached:
        sum.communities_reached +
        Number(row.communities_reached || 0),
      trainings_conducted:
        sum.trainings_conducted +
        Number(row.trainings_conducted || 0),
      livelihoods_supported:
        sum.livelihoods_supported +
        Number(row.livelihoods_supported || 0),
    }),
    {
      people_reached: 0,
      women_reached: 0,
      men_reached: 0,
      children_reached: 0,
      youth_trained: 0,
      communities_reached: 0,
      trainings_conducted: 0,
      livelihoods_supported: 0,
    },
  );

  const { error } = await supabase
    .from("grant_impact_snapshots")
    .upsert(
      {
        obligation_id: obligationId,
        grant_id: grantId,
        project_id: grant.project_id,
        period_start: periodStart,
        period_end: periodEnd,
        source_metric_count: metrics.length,
        ...totals,
        captured_by: user.id,
        captured_at: new Date().toISOString(),
      },
      { onConflict: "obligation_id" },
    );

  if (error) fail(path, error.message);

  revalidatePath(path);
  revalidatePath(`/admin/fundraising/grants/${grantId}/reporting`);
  redirect(`${path}?snapshot=1`);
}
