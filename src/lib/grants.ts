export const grantStatuses = [
  ["awarded", "Awarded"],
  ["active", "Active"],
  ["on_hold", "On Hold"],
  ["completed", "Completed"],
  ["closed", "Closed"],
  ["terminated", "Terminated"],
] as const;

export const agreementTypes = [
  ["original", "Original Agreement"],
  ["amendment", "Amendment"],
  ["extension", "Extension"],
  ["memorandum", "Memorandum"],
  ["other", "Other"],
] as const;

export const reportTypes = [
  ["inception", "Inception Report"],
  ["monthly", "Monthly Report"],
  ["quarterly", "Quarterly Report"],
  ["semi_annual", "Semi-Annual Report"],
  ["annual", "Annual Report"],
  ["narrative", "Narrative Report"],
  ["financial", "Financial Report"],
  ["audit", "Audit Report"],
  ["final_narrative", "Final Narrative Report"],
  ["final_financial", "Final Financial Report"],
  ["impact", "Impact Report"],
  ["other", "Other"],
] as const;

export const reportStatuses = [
  ["not_started", "Not Started"],
  ["in_progress", "In Progress"],
  ["ready_for_review", "Ready for Review"],
  ["submitted", "Submitted"],
  ["revision_requested", "Revision Requested"],
  ["accepted", "Accepted"],
  ["overdue", "Overdue"],
] as const;

export const reportDocumentKinds = [
  ["narrative", "Narrative"],
  ["financial", "Financial"],
  ["impact", "Impact"],
  ["audit", "Audit"],
  ["annex", "Annex"],
  ["evidence", "Evidence"],
  ["other", "Other"],
] as const;

export function moneyValue(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function formatGrantMoney(amount: number | string | null | undefined, currency = "USD") {
  if (amount === null || amount === undefined || amount === "") return "—";
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "—";
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(numeric);
  } catch {
    return `${currency} ${numeric.toLocaleString()}`;
  }
}

export function computedDeadlineStatus(dueDate: string | null | undefined, status: string) {
  if (["submitted", "accepted"].includes(status)) return status;
  if (!dueDate) return status;
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today ? "overdue" : status;
}
