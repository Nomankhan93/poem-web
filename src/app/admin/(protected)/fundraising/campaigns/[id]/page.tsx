import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { CampaignForm } from "@/components/admin/public-fundraising-forms";
import { requireSiteAdmin } from "@/lib/admin/auth";

export default async function EditCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireSiteAdmin();

  const [
    { data: campaign },
    { data: projects },
    { data: programs },
  ] = await Promise.all([
    supabase
      .from("fundraising_campaigns")
      .select("*,cover_asset:media_assets!fundraising_campaigns_cover_asset_id_fkey(id,file_name)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("projects").select("id,title").neq("status", "archived").order("title"),
    supabase.from("programs").select("id,title").order("title"),
  ]);

  if (!campaign) notFound();

  const coverRelation = campaign.cover_asset as unknown as
    | { id: string; file_name: string }
    | { id: string; file_name: string }[]
    | null;
  const coverAsset = Array.isArray(coverRelation)
    ? coverRelation[0] ?? null
    : coverRelation;

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Fundraising"
        title="Edit campaign"
        description={campaign.title}
        action={
          campaign.published ? (
            <Link
              href={`/fundraising/${campaign.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-poem-900"
            >
              Public page <ExternalLink size={15} />
            </Link>
          ) : undefined
        }
      />
      {query.saved ? <Notice>Campaign saved successfully.</Notice> : null}
      {query.error ? <Notice tone="error">{query.error}</Notice> : null}
      <div className="mt-7">
        <CampaignForm
          campaign={{ ...campaign, cover_asset: coverAsset }}
          projects={(projects ?? []).map((item) => ({ id: item.id, label: item.title }))}
          programs={(programs ?? []).map((item) => ({ id: item.id, label: item.title }))}
        />
      </div>
    </div>
  );
}
