import Link from "next/link";
import { ArrowUpRight, HeartHandshake } from "lucide-react";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { requireSiteAdmin } from "@/lib/admin/auth";
import { formatFundraisingMoney } from "@/lib/fundraising-campaigns";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSiteAdmin();

  const [{ data: campaigns }, { data: donations }] = await Promise.all([
    supabase
      .from("fundraising_campaigns")
      .select("id,slug,title,category,funding_target,currency,status,featured,published,end_date,project:projects(title)")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("fundraising_donations")
      .select("campaign_id,amount,currency")
      .eq("status", "verified"),
  ]);

  const totals = new Map<string, number>();
  for (const donation of donations ?? []) {
    totals.set(
      donation.campaign_id,
      (totals.get(donation.campaign_id) ?? 0) + Number(donation.amount || 0),
    );
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Fundraising"
        title="Public fundraising campaigns"
        description="Create campaign stories, funding targets and public progress pages."
        action={
          <Link
            href="/admin/fundraising/campaigns/new"
            className="inline-flex items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white"
          >
            New campaign <ArrowUpRight size={15} />
          </Link>
        }
      />
      {params.saved ? <Notice>Campaign saved.</Notice> : null}
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <div className="mt-7 space-y-4">
        {(campaigns ?? []).map((campaign) => {
          const raised = totals.get(campaign.id) ?? 0;
          const projectRelation = campaign.project as unknown as
            | { title: string }
            | { title: string }[]
            | null;
          const project = Array.isArray(projectRelation)
            ? projectRelation[0] ?? null
            : projectRelation;

          return (
            <Link
              key={campaign.id}
              href={`/admin/fundraising/campaigns/${campaign.id}`}
              className="grid gap-5 rounded-[24px] border border-black/[0.06] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-poem-soft text-poem-900">
                  <HeartHandshake size={18} />
                </div>
                <div>
                  <p className="font-extrabold text-poem-950">{campaign.title}</p>
                  <p className="mt-1 text-xs text-poem-muted">
                    {project?.title || campaign.category || "Standalone campaign"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-poem-soft px-3 py-1 text-[10px] font-extrabold uppercase text-poem-800">
                      {campaign.status}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-extrabold uppercase text-gray-700">
                      {campaign.published ? "published" : "private"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:text-right">
                <p className="text-sm font-extrabold text-poem-900">
                  {formatFundraisingMoney(raised, campaign.currency)} raised
                </p>
                <p className="mt-1 text-xs text-poem-muted">
                  Target {formatFundraisingMoney(Number(campaign.funding_target || 0), campaign.currency)}
                </p>
              </div>
            </Link>
          );
        })}

        {!campaigns?.length ? (
          <div className="rounded-[24px] bg-white p-8 text-center text-sm text-poem-muted">
            No fundraising campaigns yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
