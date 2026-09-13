import Link from "next/link";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { requireSiteAdmin } from "@/lib/admin/auth";
import { deadlineLabel } from "@/lib/fundraising";
import { computedDeadlineStatus, formatGrantMoney } from "@/lib/grants";

export default async function FundraisingDashboard({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSiteAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const [
    donors,
    opportunities,
    applications,
    grants,
    reports,
    { data: receipts },
    campaigns,
    { data: donations },
    { data: opportunityDeadlines },
    { data: applicationDeadlines },
  ] = await Promise.all([
    supabase.from("fundraising_donors").select("*", { count: "exact", head: true }),
    supabase
      .from("funding_opportunities")
      .select("*", { count: "exact", head: true })
      .not("status", "in", '("closed","not_eligible")'),
    supabase
      .from("grant_applications")
      .select("*", { count: "exact", head: true })
      .not("stage", "in", '("awarded","rejected","withdrawn")'),
    supabase
      .from("grant_awards")
      .select("*", { count: "exact", head: true })
      .in("status", ["awarded", "active", "on_hold"]),
    supabase.from("grant_reporting_obligations").select("id,due_date,status"),
    supabase.from("grant_fund_receipts").select("amount,currency"),
    supabase
      .from("fundraising_campaigns")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("fundraising_donations").select("status"),
    supabase
      .from("funding_opportunities")
      .select("id,title,deadline,priority")
      .gte("deadline", today)
      .not("status", "in", '("closed","not_eligible","submitted")')
      .order("deadline")
      .limit(5),
    supabase
      .from("grant_applications")
      .select("id,title,submission_deadline,stage")
      .gte("submission_deadline", today)
      .not("stage", "in", '("submitted","under_review","shortlisted","awarded","rejected","withdrawn")')
      .order("submission_deadline")
      .limit(5),
  ]);

  const usdReceived = (receipts ?? []).reduce(
    (sum, row) => row.currency === "USD" ? sum + Number(row.amount || 0) : sum,
    0,
  );
  const overdueReports = (reports.data ?? []).filter(
    (row) => computedDeadlineStatus(row.due_date, row.status) === "overdue",
  ).length;
  const verifiedDonations = (donations ?? []).filter(
    (row) => row.status === "verified",
  ).length;
  const pendingDonations = (donations ?? []).filter(
    (row) => row.status === "pending",
  ).length;

  const cards = [
    ["Donors", donors.count ?? 0, "/admin/fundraising/donors"],
    ["Active opportunities", opportunities.count ?? 0, "/admin/fundraising/opportunities"],
    ["Applications in pipeline", applications.count ?? 0, "/admin/fundraising/applications"],
    ["Active grants", grants.count ?? 0, "/admin/fundraising/grants"],
    ["Active public campaigns", campaigns.count ?? 0, "/admin/fundraising/campaigns"],
    ["Verified donations", verifiedDonations, "/admin/fundraising/donations?status=verified"],
    ["Funds received (USD)", formatGrantMoney(usdReceived, "USD"), "/admin/fundraising/grants"],
    ["Overdue donor reports", overdueReports, "/admin/fundraising/reporting"],
  ] as const;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Fundraising & Grants"
        title="Funding pipeline"
        description="Track donor relationships, funding calls, proposals, awarded grants, public campaigns, donations, funds received and reporting obligations."
      />
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, href]) => (
          <Link
            key={label}
            href={href}
            className="rounded-[24px] border border-black/[0.06] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <p className="text-3xl font-black text-poem-950">{value}</p>
            <p className="mt-2 text-xs font-bold text-poem-muted">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/admin/fundraising/campaigns" className="rounded-full bg-poem-lime px-5 py-3 text-sm font-extrabold text-poem-950">Public campaigns</Link>
        <Link href="/admin/fundraising/donations" className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-poem-900">Donation ledger{pendingDonations ? ` (${pendingDonations} pending)` : ""}</Link>
        <Link href="/admin/fundraising/projects" className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-poem-900">Project funding targets</Link>
        <Link href="/admin/fundraising/analytics" className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-poem-900">Fundraising analytics</Link>
        <Link href="/admin/fundraising/grants" className="rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white">Grant awards</Link>
        <Link href="/admin/fundraising/reporting" className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-poem-900">Donor reporting center</Link>
        <Link href="/admin/fundraising/deadlines" className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-poem-900">Proposal deadline center</Link>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <DeadlinePanel
          title="Opportunity deadlines"
          rows={(opportunityDeadlines ?? []).map((row) => ({
            id: row.id,
            title: row.title,
            date: row.deadline,
            meta: row.priority,
            href: `/admin/fundraising/opportunities/${row.id}`,
          }))}
        />
        <DeadlinePanel
          title="Application deadlines"
          rows={(applicationDeadlines ?? []).map((row) => ({
            id: row.id,
            title: row.title,
            date: row.submission_deadline,
            meta: row.stage.replaceAll("_", " "),
            href: `/admin/fundraising/applications/${row.id}`,
          }))}
        />
      </div>
    </div>
  );
}

function DeadlinePanel({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    id: string;
    title: string;
    date: string | null;
    meta: string;
    href: string;
  }>;
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white">
      <div className="border-b border-black/5 p-6 font-extrabold text-poem-950">{title}</div>
      <div className="divide-y divide-black/5">
        {rows.map((row) => (
          <Link key={row.id} href={row.href} className="block p-5 transition hover:bg-poem-soft/50">
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-extrabold text-poem-950">{row.title}</p>
                <p className="mt-1 text-xs capitalize text-poem-muted">{row.meta}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-poem-900">
                  {row.date
                    ? new Date(`${row.date}T00:00:00`).toLocaleDateString()
                    : "No deadline"}
                </p>
                <p className="mt-1 text-xs text-poem-muted">{deadlineLabel(row.date)}</p>
              </div>
            </div>
          </Link>
        ))}
        {!rows.length ? (
          <p className="p-6 text-sm text-poem-muted">No upcoming deadlines.</p>
        ) : null}
      </div>
    </section>
  );
}
