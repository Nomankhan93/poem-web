export const donorTypes = [
  ["un_agency", "UN Agency"], ["government", "Government"], ["embassy", "Embassy"],
  ["foundation", "Foundation"], ["ingo", "INGO"], ["corporate_csr", "Corporate / CSR"],
  ["development_agency", "Development Agency"], ["international_donor", "International Donor"],
  ["local_philanthropy", "Local Philanthropy"], ["individual_hnwi", "Individual / HNWI"], ["other", "Other"],
] as const;

export const opportunityStatuses = [
  ["identified", "Identified"], ["reviewing", "Reviewing"], ["eligible", "Eligible"],
  ["not_eligible", "Not Eligible"], ["preparing", "Preparing"], ["submitted", "Submitted"], ["closed", "Closed"],
] as const;

export const applicationStages = [
  ["draft", "Draft"], ["concept_note", "Concept Note"], ["internal_review", "Internal Review"],
  ["proposal_development", "Proposal Development"], ["budget_review", "Budget Review"],
  ["management_approval", "Management Approval"], ["ready_to_submit", "Ready to Submit"],
  ["submitted", "Submitted"], ["under_review", "Under Review"],
  ["clarification_requested", "Clarification Requested"], ["shortlisted", "Shortlisted"],
  ["awarded", "Awarded"], ["rejected", "Rejected"], ["withdrawn", "Withdrawn"],
] as const;

export const documentTypes = [
  ["concept_note", "Concept Note"], ["proposal", "Full Proposal"], ["budget", "Budget"],
  ["logframe", "Logframe / Results Framework"], ["workplan", "Work Plan"],
  ["organization_profile", "Organization Profile"], ["registration_document", "Registration Document"],
  ["policy", "Policy"], ["previous_report", "Previous Report"], ["annex", "Annex"], ["other", "Other"],
] as const;

export function splitList(value: FormDataEntryValue | null) {
  return String(value ?? "").split(/\r?\n|,/).map((v) => v.trim()).filter(Boolean);
}
export function formatMoney(amount: number | string | null | undefined, currency = "USD") {
  if (amount === null || amount === undefined || amount === "") return "—";
  const numeric = Number(amount); if (!Number.isFinite(numeric)) return "—";
  try { return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(numeric); }
  catch { return `${currency} ${numeric.toLocaleString()}`; }
}
export function daysUntil(dateValue: string | null | undefined) {
  if (!dateValue) return null;
  const target = new Date(`${dateValue}T23:59:59`); const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}
export function deadlineLabel(dateValue: string | null | undefined) {
  const days = daysUntil(dateValue); if (days === null) return "No deadline";
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today"; if (days === 1) return "Due tomorrow"; return `${days} days remaining`;
}
