import { AdminPageHeader, StatCard } from "@/components/admin/admin-ui";
import { requireSiteAdmin } from "@/lib/admin/auth";
import { formatFundraisingMoney } from "@/lib/fundraising-campaigns";

export default async function FundraisingAnalyticsPage() {
  const { supabase } = await requireSiteAdmin();

  const [
    { data: profiles },
    { data: campaigns },
    { data: donations },
    { data: grants },
    { data: receipts },
  ] = await Promise.all([
    supabase.from("project_funding_profiles").select("funding_target,currency"),
    supabase.from("fundraising_campaigns").select("id,title,funding_target,currency,status,published"),
    supabase.from("fundraising_donations").select("campaign_id,amount,currency,status,donation_date"),
    supabase.from("grant_awards").select("award_amount,currency,status"),
    supabase.from("grant_fund_receipts").select("amount,currency,received_date"),
  ]);

  type Totals = {
    projectTargets: number;
    campaignTargets: number;
    grantsSecured: number;
    grantsReceived: number;
    donations: number;
  };

  const byCurrency = new Map<string, Totals>();
  const get = (currency: string) => {
    const key = currency || "PKR";
    const current = byCurrency.get(key) ?? {
      projectTargets: 0,
      campaignTargets: 0,
      grantsSecured: 0,
      grantsReceived: 0,
      donations: 0,
    };
    byCurrency.set(key, current);
    return current;
  };

  for (const row of profiles ?? []) get(row.currency).projectTargets += Number(row.funding_target || 0);
  for (const row of campaigns ?? []) get(row.currency).campaignTargets += Number(row.funding_target || 0);
  for (const row of grants ?? []) {
    if (row.status !== "terminated") get(row.currency).grantsSecured += Number(row.award_amount || 0);
  }
  for (const row of receipts ?? []) get(row.currency).grantsReceived += Number(row.amount || 0);
  for (const row of donations ?? []) {
    if (row.status === "verified") get(row.currency).donations += Number(row.amount || 0);
  }

  const campaignRaised = new Map<string, number>();
  for (const row of donations ?? []) {
    if (row.status !== "verified") continue;
    campaignRaised.set(
      row.campaign_id,
      (campaignRaised.get(row.campaign_id) ?? 0) + Number(row.amount || 0),
    );
  }

  const rankedCampaigns = [...(campaigns ?? [])]
    .map((campaign) => {
      const raised = campaignRaised.get(campaign.id) ?? 0;
      const target = Number(campaign.funding_target || 0);
      return {
        ...campaign,
        raised,
        progress: target > 0 ? Math.min((raised / target) * 100, 100) : 0,
      };
    })
    .sort((a, b) => b.raised - a.raised)
    .slice(0, 8);

  const verifiedCount = (donations ?? []).filter((row) => row.status === "verified").length;
  const pendingCount = (donations ?? []).filter((row) => row.status === "pending").length;
  const activeCampaigns = (campaigns ?? []).filter((row) => row.status === "active").length;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Fundraising"
        title="Fundraising analytics"
        description="Portfolio-level funding visibility without mixing currencies into misleading totals."
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Active campaigns" value={activeCampaigns} detail="Campaigns currently marked active" />
        <StatCard label="Verified donations" value={verifiedCount} detail="Included in public fundraising totals" />
        <StatCard label="Pending donations" value={pendingCount} detail="Waiting for verification" />
      </div>

      <section className="mt-7 rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">Funding portfolio by currency</h2>
        <p className="mt-2 text-sm text-poem-muted">
          PKR, USD and other currencies are kept separate; no exchange-rate assumptions are made.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[...byCurrency.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([currency, totals]) => (
            <div key={currency} className="rounded-[22px] bg-poem-soft p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-poem-700">{currency}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Metric label="Project targets" value={formatFundraisingMoney(totals.projectTargets, currency)} />
                <Metric label="Campaign targets" value={formatFundraisingMoney(totals.campaignTargets, currency)} />
                <Metric label="Grant awards" value={formatFundraisingMoney(totals.grantsSecured, currency)} />
                <Metric label="Grant funds received" value={formatFundraisingMoney(totals.grantsReceived, currency)} />
                <Metric label="Verified donations" value={formatFundraisingMoney(totals.donations, currency)} />
              </div>
            </div>
          ))}
          {!byCurrency.size ? (
            <p className="text-sm text-poem-muted">No funding data yet.</p>
          ) : null}
        </div>
      </section>

      <section className="mt-7 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white">
        <div className="border-b border-black/5 p-6">
          <h2 className="font-extrabold text-poem-950">Campaign performance</h2>
        </div>
        <div className="divide-y divide-black/5">
          {rankedCampaigns.map((campaign) => (
            <div key={campaign.id} className="p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="font-extrabold text-poem-950">{campaign.title}</p>
                  <p className="mt-1 text-xs capitalize text-poem-muted">{campaign.status} · {campaign.published ? "published" : "private"}</p>
                </div>
                <p className="text-sm font-extrabold text-poem-900">
                  {formatFundraisingMoney(campaign.raised, campaign.currency)} / {formatFundraisingMoney(Number(campaign.funding_target || 0), campaign.currency)}
                </p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/5">
                <div className="h-full rounded-full bg-poem-700" style={{ width: `${campaign.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-poem-muted">{label}</p>
      <p className="mt-1 text-lg font-black text-poem-950">{value}</p>
    </div>
  );
}
