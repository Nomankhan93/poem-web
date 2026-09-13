import Link from "next/link";
import { ArrowUpRight, Target } from "lucide-react";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { requireSiteAdmin } from "@/lib/admin/auth";
import { formatFundraisingMoney } from "@/lib/fundraising-campaigns";

export default async function ProjectFundingPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSiteAdmin();

  const [
    { data: projects },
    { data: profiles },
    { data: grants },
    { data: receipts },
    { data: donations },
  ] = await Promise.all([
      supabase
        .from("projects")
        .select("id,slug,title,status,published")
        .neq("status", "archived")
        .order("title"),
      supabase.from("project_funding_profiles").select("*"),
      supabase
        .from("grant_awards")
        .select("project_id,award_amount,currency,status")
        .neq("status", "terminated"),
      supabase
        .from("grant_fund_receipts")
        .select("amount,currency,grant:grant_awards(project_id)"),
      supabase
        .from("fundraising_donations")
        .select("amount,currency,campaign:fundraising_campaigns(project_id)")
        .eq("status", "verified"),
    ]);

  type FundingProfileRow = {
    id: string;
    project_id: string;
    funding_target: number;
    currency: string;
    fundraising_status: string;
    public_fundraising_enabled: boolean;
  };

  const profileMap = new Map<string, FundingProfileRow>(
    (profiles ?? []).map((row) => [row.project_id, row as FundingProfileRow]),
  );

  return (
    <div>
      <AdminPageHeader
        eyebrow="Fundraising"
        title="Project funding targets"
        description="Set project funding targets and control which combined funding summaries can appear publicly."
      />

      {params.saved ? <Notice>Project funding profile saved.</Notice> : null}
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <div className="mt-7 space-y-4">
        {(projects ?? []).map((project) => {
          const profile = profileMap.get(project.id);
          const currency = profile?.currency ?? "PKR";
          const secured = (grants ?? []).reduce(
            (sum, grant) =>
              grant.project_id === project.id && grant.currency === currency
                ? sum + Number(grant.award_amount || 0)
                : sum,
            0,
          );
          const grantReceived = (receipts ?? []).reduce((sum, receipt) => {
            const relation = receipt.grant as unknown as
              | { project_id: string | null }
              | { project_id: string | null }[]
              | null;
            const grant = Array.isArray(relation) ? relation[0] ?? null : relation;
            return grant?.project_id === project.id && receipt.currency === currency
              ? sum + Number(receipt.amount || 0)
              : sum;
          }, 0);
          const publicDonations = (donations ?? []).reduce((sum, donation) => {
            const relation = donation.campaign as unknown as
              | { project_id: string | null }
              | { project_id: string | null }[]
              | null;
            const campaign = Array.isArray(relation) ? relation[0] ?? null : relation;
            return campaign?.project_id === project.id && donation.currency === currency
              ? sum + Number(donation.amount || 0)
              : sum;
          }, 0);
          const totalSecured = secured + publicDonations;
          const totalReceived = grantReceived + publicDonations;

          return (
            <Link
              key={project.id}
              href={`/admin/fundraising/projects/${project.id}`}
              className="grid gap-5 rounded-[24px] border border-black/[0.06] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-poem-soft text-poem-900">
                  <Target size={18} />
                </div>
                <div>
                  <p className="font-extrabold text-poem-950">{project.title}</p>
                  <p className="mt-1 text-xs capitalize text-poem-muted">
                    {profile?.fundraising_status?.replaceAll("_", " ") ?? "No funding target yet"}
                    {profile?.public_fundraising_enabled ? " · Public" : " · Private"}
                  </p>
                </div>
              </div>

              <div className="text-sm lg:text-right">
                <p className="font-extrabold text-poem-900">
                  Target {formatFundraisingMoney(Number(profile?.funding_target ?? 0), currency)}
                </p>
                <p className="mt-1 text-xs text-poem-muted">
                  Total secured {formatFundraisingMoney(totalSecured, currency)} · Received {formatFundraisingMoney(totalReceived, currency)} · Donations {formatFundraisingMoney(publicDonations, currency)}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-poem-700">
                  Configure <ArrowUpRight size={13} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
