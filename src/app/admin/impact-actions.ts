"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string) {
  const parsed = Number(value(formData, key) || 0);
  return Number.isFinite(parsed) && parsed >= 0
    ? Math.floor(parsed)
    : 0;
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function isIsoDate(valueToCheck: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(valueToCheck);
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function saveImpactMetric(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = value(formData, "id");
  const path = id ? `/admin/impact/${id}` : "/admin/impact";
  const periodStart = value(formData, "period_start");
  const periodEnd = value(formData, "period_end");

  if (
    !isIsoDate(periodStart) ||
    !isIsoDate(periodEnd) ||
    periodEnd < periodStart
  ) {
    fail(path, "A valid reporting period is required.");
  }

  const year = Number(periodStart.slice(0, 4));

  const payload = {
    project_id: value(formData, "project_id"),
    year,
    period_start: periodStart,
    period_end: periodEnd,
    district: value(formData, "district"),
    people_reached: numberValue(formData, "people_reached"),
    women_reached: numberValue(formData, "women_reached"),
    men_reached: numberValue(formData, "men_reached"),
    children_reached: numberValue(formData, "children_reached"),
    youth_trained: numberValue(formData, "youth_trained"),
    communities_reached: numberValue(
      formData,
      "communities_reached",
    ),
    trainings_conducted: numberValue(
      formData,
      "trainings_conducted",
    ),
    livelihoods_supported: numberValue(
      formData,
      "livelihoods_supported",
    ),
    published: checked(formData, "published"),
  };

  if (!payload.project_id || year < 2000 || year > 2100) {
    fail(path, "Project and valid reporting period are required.");
  }

  const result = id
    ? await supabase
        .from("project_metrics")
        .update(payload)
        .eq("id", id)
    : await supabase
        .from("project_metrics")
        .insert(payload)
        .select("id")
        .single();

  if (result.error) fail(path, result.error.message);

  const metricId =
    id || ("data" in result ? result.data?.id : null);

  revalidatePath("/");
  revalidatePath("/impact");
  revalidatePath("/admin");
  revalidatePath("/admin/impact");
  revalidatePath("/admin/fundraising/grants");

  redirect(
    metricId
      ? `/admin/impact/${metricId}?saved=1`
      : "/admin/impact?saved=1",
  );
}

export async function deleteImpactMetric(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = value(formData, "id");

  const { error } = await supabase
    .from("project_metrics")
    .delete()
    .eq("id", id);

  if (error) fail("/admin/impact", error.message);

  revalidatePath("/");
  revalidatePath("/impact");
  revalidatePath("/admin/impact");
  revalidatePath("/admin/fundraising/grants");
  redirect("/admin/impact?deleted=1");
}
