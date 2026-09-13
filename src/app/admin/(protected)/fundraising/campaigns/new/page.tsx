import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { CampaignForm } from "@/components/admin/public-fundraising-forms";
import { requireSiteAdmin } from "@/lib/admin/auth";

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSiteAdmin();
  const [{ data: projects }, { data: programs }] = await Promise.all([
    supabase.from("projects").select("id,title").neq("status", "archived").order("title"),
    supabase.from("programs").select("id,title").order("title"),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Fundraising"
        title="Create public campaign"
        description="Create a fundraising campaign without enabling online payment processing."
      />
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}
      <div className="mt-7">
        <CampaignForm
          projects={(projects ?? []).map((item) => ({ id: item.id, label: item.title }))}
          programs={(programs ?? []).map((item) => ({ id: item.id, label: item.title }))}
        />
      </div>
    </div>
  );
}
