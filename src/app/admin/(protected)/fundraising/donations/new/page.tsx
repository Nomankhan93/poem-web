import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { DonationForm } from "@/components/admin/public-fundraising-forms";
import { requireSiteAdmin } from "@/lib/admin/auth";

export default async function NewDonationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSiteAdmin();
  const { data: campaigns } = await supabase
    .from("fundraising_campaigns")
    .select("id,title,currency")
    .not("status", "in", '("closed")')
    .order("title");

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Fundraising"
        title="Record donation"
        description="Record a donation against a campaign. Only verified donations count toward public totals."
      />
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}
      <div className="mt-7">
        <DonationForm
          campaigns={(campaigns ?? []).map((item) => ({
            id: item.id,
            label: item.title,
            currency: item.currency,
          }))}
        />
      </div>
    </div>
  );
}
