"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSiteAdmin } from "@/lib/admin/auth";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function nullable(formData: FormData, key: string) {
  return value(formData, key) || null;
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function amount(formData: FormData, key: string) {
  const raw = value(formData, key);
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function positiveInteger(formData: FormData, key: string) {
  const raw = value(formData, key);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function revalidateFundraisingPublic(slug?: string, projectSlug?: string) {
  revalidatePath("/");
  revalidatePath("/fundraising");
  revalidatePath("/donate");
  revalidatePath("/admin/fundraising");
  revalidatePath("/admin/fundraising/campaigns");
  revalidatePath("/admin/fundraising/donations");
  revalidatePath("/admin/fundraising/analytics");
  revalidatePath("/admin/fundraising/projects");
  if (slug) revalidatePath(`/fundraising/${slug}`);
  if (projectSlug) revalidatePath(`/projects/${projectSlug}`);
}

export async function saveProjectFundingProfile(formData: FormData) {
  const { supabase, user } = await requireSiteAdmin();
  const projectId = value(formData, "project_id");
  const projectSlug = value(formData, "project_slug");
  const path = `/admin/fundraising/projects/${projectId}`;

  if (!projectId) fail("/admin/fundraising/projects", "Project is required.");

  const payload = {
    project_id: projectId,
    funding_target: amount(formData, "funding_target"),
    currency: (value(formData, "currency") || "PKR").toUpperCase(),
    fundraising_status: value(formData, "fundraising_status") || "seeking",
    funding_deadline: nullable(formData, "funding_deadline"),
    public_fundraising_enabled: checked(formData, "public_fundraising_enabled"),
    public_summary: value(formData, "public_summary"),
  };

  if (payload.currency.length !== 3) {
    fail(path, "Currency must use a 3-letter code such as PKR or USD.");
  }

  const { error } = await supabase.from("project_funding_profiles").upsert(
    {
      ...payload,
      created_by: user.id,
    },
    { onConflict: "project_id" },
  );

  if (error) fail(path, error.message);

  revalidateFundraisingPublic(undefined, projectSlug || undefined);
  redirect(`${path}?saved=1`);
}

export async function saveFundraisingCampaign(formData: FormData) {
  const { supabase, user } = await requireSiteAdmin();
  const id = value(formData, "id");
  const path = id
    ? `/admin/fundraising/campaigns/${id}`
    : "/admin/fundraising/campaigns/new";

  const payload = {
    project_id: nullable(formData, "project_id"),
    program_id: nullable(formData, "program_id"),
    slug: value(formData, "slug").toLowerCase(),
    title: value(formData, "title"),
    short_summary: value(formData, "short_summary"),
    story: value(formData, "story"),
    expected_impact: value(formData, "expected_impact"),
    beneficiary_target: positiveInteger(formData, "beneficiary_target"),
    location: value(formData, "location"),
    category: value(formData, "category"),
    funding_target: amount(formData, "funding_target"),
    currency: (value(formData, "currency") || "PKR").toUpperCase(),
    start_date: nullable(formData, "start_date"),
    end_date: nullable(formData, "end_date"),
    status: value(formData, "status") || "draft",
    featured: checked(formData, "featured"),
    published: checked(formData, "published"),
    cover_asset_id: nullable(formData, "cover_asset_id"),
    donation_instructions: value(formData, "donation_instructions"),
  };

  if (!payload.title || !payload.slug) {
    fail(path, "Campaign title and slug are required.");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) {
    fail(path, "Campaign slug must contain lowercase letters, numbers and hyphens only.");
  }

  if (payload.currency.length !== 3) {
    fail(path, "Currency must use a 3-letter code such as PKR or USD.");
  }

  if (
    payload.start_date &&
    payload.end_date &&
    payload.end_date < payload.start_date
  ) {
    fail(path, "Campaign end date cannot be before the start date.");
  }

  const result = id
    ? await supabase.from("fundraising_campaigns").update(payload).eq("id", id)
    : await supabase
        .from("fundraising_campaigns")
        .insert({ ...payload, created_by: user.id })
        .select("id")
        .single();

  if (result.error) fail(path, result.error.message);
  const campaignId = id || ("data" in result ? result.data?.id : null);

  revalidateFundraisingPublic(payload.slug);
  redirect(
    campaignId
      ? `/admin/fundraising/campaigns/${campaignId}?saved=1`
      : "/admin/fundraising/campaigns?saved=1",
  );
}

export async function saveFundraisingDonation(formData: FormData) {
  const { supabase, user } = await requireSiteAdmin();
  const id = value(formData, "id");
  const path = id
    ? `/admin/fundraising/donations/${id}`
    : "/admin/fundraising/donations/new";

  const campaignId = value(formData, "campaign_id");
  const donationAmount = amount(formData, "amount");
  const status = value(formData, "status") || "pending";

  if (!campaignId || donationAmount <= 0) {
    fail(path, "Campaign and a positive donation amount are required.");
  }

  const payload = {
    campaign_id: campaignId,
    donor_name: value(formData, "donor_name"),
    donor_type: value(formData, "donor_type") || "individual",
    amount: donationAmount,
    donation_date: value(formData, "donation_date") || new Date().toISOString().slice(0, 10),
    payment_method: value(formData, "payment_method") || "bank_transfer",
    transaction_reference: value(formData, "transaction_reference"),
    receipt_number: value(formData, "receipt_number"),
    show_donor_publicly: checked(formData, "show_donor_publicly"),
    status,
    notes: value(formData, "notes"),
    verified_by: status === "verified" ? user.id : null,
    verified_at: status === "verified" ? new Date().toISOString() : null,
  };

  const result = id
    ? await supabase.from("fundraising_donations").update(payload).eq("id", id)
    : await supabase
        .from("fundraising_donations")
        .insert({ ...payload, created_by: user.id })
        .select("id")
        .single();

  if (result.error) fail(path, result.error.message);
  const donationId = id || ("data" in result ? result.data?.id : null);

  const { data: campaign } = await supabase
    .from("fundraising_campaigns")
    .select("slug,project:projects(slug)")
    .eq("id", campaignId)
    .maybeSingle();

  const projectRelation = campaign?.project as unknown as
    | { slug: string }
    | { slug: string }[]
    | null
    | undefined;
  const project = Array.isArray(projectRelation)
    ? projectRelation[0] ?? null
    : projectRelation;

  revalidateFundraisingPublic(campaign?.slug, project?.slug);
  redirect(
    donationId
      ? `/admin/fundraising/donations/${donationId}?saved=1`
      : "/admin/fundraising/donations?saved=1",
  );
}

export async function setFundraisingDonationStatus(formData: FormData) {
  const { supabase, user } = await requireSiteAdmin();
  const id = value(formData, "id");
  const status = value(formData, "status");
  const returnTo = value(formData, "return_to") || "/admin/fundraising/donations";

  if (!id || !["pending", "verified", "rejected", "refunded"].includes(status)) {
    fail(returnTo, "Invalid donation status update.");
  }

  const { data: donation, error: lookupError } = await supabase
    .from("fundraising_donations")
    .select("campaign_id")
    .eq("id", id)
    .maybeSingle();

  if (lookupError || !donation) {
    fail(returnTo, lookupError?.message ?? "Donation not found.");
  }

  const { error } = await supabase
    .from("fundraising_donations")
    .update({
      status,
      verified_by: status === "verified" ? user.id : null,
      verified_at: status === "verified" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) fail(returnTo, error.message);

  const { data: campaign } = await supabase
    .from("fundraising_campaigns")
    .select("slug,project:projects(slug)")
    .eq("id", donation.campaign_id)
    .maybeSingle();

  const projectRelation = campaign?.project as unknown as
    | { slug: string }
    | { slug: string }[]
    | null
    | undefined;
  const project = Array.isArray(projectRelation)
    ? projectRelation[0] ?? null
    : projectRelation;

  revalidateFundraisingPublic(campaign?.slug, project?.slug);
  redirect(`${returnTo}?updated=1`);
}
