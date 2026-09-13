import { notFound } from "next/navigation";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { DonationForm } from "@/components/admin/public-fundraising-forms";
import { requireSiteAdmin } from "@/lib/admin/auth";

export default async function EditDonationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireSiteAdmin();
  const [{ data: donation }, { data: campaigns }] = await Promise.all([
    supabase.from("fundraising_donations").select("*").eq("id", id).maybeSingle(),
    supabase.from("fundraising_campaigns").select("id,title,currency").order("title"),
  ]);

  if (!donation) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Fundraising"
        title="Edit donation"
        description={donation.receipt_number ? `Receipt ${donation.receipt_number}` : donation.donor_name || "Donation record"}
      />
      {query.saved ? <Notice>Donation saved.</Notice> : null}
      {query.error ? <Notice tone="error">{query.error}</Notice> : null}
      <div className="mt-7">
        <DonationForm
          donation={donation}
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
