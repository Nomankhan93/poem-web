import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type PublicCampaign = {
  id: string;
  slug: string;
  title: string;
  shortSummary: string;
  story: string;
  expectedImpact: string;
  beneficiaryTarget: number | null;
  location: string;
  category: string;
  fundingTarget: number;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  featured: boolean;
  donationInstructions: string;
  projectId: string | null;
  projectSlug: string | null;
  projectTitle: string | null;
  programTitle: string | null;
  coverUrl: string | null;
  coverAltText: string;
  amountRaised: number;
  fundingGap: number;
  progressPercent: number;
  verifiedDonations: number;
};

export type PublicProjectFunding = {
  projectId: string;
  projectSlug: string;
  fundingTarget: number;
  currency: string;
  fundraisingStatus: string;
  fundingDeadline: string | null;
  publicSummary: string;
  grantSecured: number;
  grantReceived: number;
  publicDonations: number;
  totalSecured: number;
  totalReceived: number;
  fundingGap: number;
  progressPercent: number;
  campaignSlug: string | null;
};

function number(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function coverUrl(
  supabase: ReturnType<typeof createPublicClient>,
  bucket: string | null,
  path: string | null,
) {
  if (!bucket || !path) return null;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function mapCampaign(
  supabase: ReturnType<typeof createPublicClient>,
  row: Record<string, unknown>,
): PublicCampaign {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    shortSummary: String(row.short_summary ?? ""),
    story: String(row.story ?? ""),
    expectedImpact: String(row.expected_impact ?? ""),
    beneficiaryTarget:
      row.beneficiary_target === null || row.beneficiary_target === undefined
        ? null
        : number(row.beneficiary_target),
    location: String(row.location ?? ""),
    category: String(row.category ?? ""),
    fundingTarget: number(row.funding_target),
    currency: String(row.currency ?? "PKR"),
    startDate: row.start_date ? String(row.start_date) : null,
    endDate: row.end_date ? String(row.end_date) : null,
    status: String(row.status ?? "active"),
    featured: Boolean(row.featured),
    donationInstructions: String(row.donation_instructions ?? ""),
    projectId: row.project_id ? String(row.project_id) : null,
    projectSlug: row.project_slug ? String(row.project_slug) : null,
    projectTitle: row.project_title ? String(row.project_title) : null,
    programTitle: row.program_title ? String(row.program_title) : null,
    coverUrl: coverUrl(
      supabase,
      row.cover_bucket ? String(row.cover_bucket) : null,
      row.cover_path ? String(row.cover_path) : null,
    ),
    coverAltText: String(row.cover_alt_text ?? ""),
    amountRaised: number(row.amount_raised),
    fundingGap: number(row.funding_gap),
    progressPercent: number(row.progress_percent),
    verifiedDonations: number(row.verified_donations),
  };
}

export function formatFundraisingMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString("en-PK")}`;
  }
}

export async function getPublicCampaigns() {
  if (!isSupabaseConfigured()) return [] as PublicCampaign[];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc(
      "get_public_fundraising_campaigns",
      { p_slug: null },
    );

    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map((row) =>
      mapCampaign(supabase, row),
    );
  } catch (error) {
    console.error("Public fundraising campaign query failed:", error);
    return [];
  }
}

export async function getFeaturedCampaign() {
  const campaigns = await getPublicCampaigns();
  return (
    campaigns.find(
      (campaign) => campaign.featured && campaign.status === "active",
    ) ?? campaigns.find((campaign) => campaign.status === "active") ?? null
  );
}

export async function getPublicCampaignBySlug(slug: string) {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc(
      "get_public_fundraising_campaigns",
      { p_slug: slug },
    );

    const row = (data as Record<string, unknown>[] | null)?.[0];
    if (error || !row) return null;

    return mapCampaign(supabase, row);
  } catch (error) {
    console.error("Public fundraising campaign detail query failed:", error);
    return null;
  }
}

export async function getPublicCampaignSupporters(campaignId: string) {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc(
      "get_public_campaign_supporters",
      { p_campaign_id: campaignId, p_limit: 12 },
    );

    if (error || !data) return [];

    return (data as Array<Record<string, unknown>>).map((row) => ({
      displayName: String(row.display_name ?? "Anonymous Donor"),
      amount: number(row.amount),
      currency: String(row.currency ?? "PKR"),
      donationDate: String(row.donation_date),
    }));
  } catch (error) {
    console.error("Public campaign supporters query failed:", error);
    return [];
  }
}

export async function getPublicProjectFundingBySlug(slug: string) {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc(
      "get_public_project_funding_by_slug",
      { p_slug: slug },
    );

    const row = (data as Record<string, unknown>[] | null)?.[0];
    if (error || !row) return null;

    return {
      projectId: String(row.project_id),
      projectSlug: String(row.project_slug),
      fundingTarget: number(row.funding_target),
      currency: String(row.currency ?? "PKR"),
      fundraisingStatus: String(row.fundraising_status ?? "seeking"),
      fundingDeadline: row.funding_deadline
        ? String(row.funding_deadline)
        : null,
      publicSummary: String(row.public_summary ?? ""),
      grantSecured: number(row.grant_secured),
      grantReceived: number(row.grant_received),
      publicDonations: number(row.public_donations),
      totalSecured: number(row.total_secured),
      totalReceived: number(row.total_received),
      fundingGap: number(row.funding_gap),
      progressPercent: number(row.progress_percent),
      campaignSlug: row.campaign_slug ? String(row.campaign_slug) : null,
    } satisfies PublicProjectFunding;
  } catch (error) {
    console.error("Public project funding query failed:", error);
    return null;
  }
}
