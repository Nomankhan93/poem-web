import Link from "next/link";
import { ArrowUpRight, CircleDollarSign } from "lucide-react";
import {
  setFundraisingDonationStatus,
} from "@/app/admin/fundraising-public-actions";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { requireSiteAdmin } from "@/lib/admin/auth";
import { formatFundraisingMoney } from "@/lib/fundraising-campaigns";

export default async function DonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; updated?: string; error?: string; status?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSiteAdmin();

  let request = supabase
    .from("fundraising_donations")
    .select("id,donor_name,donor_type,amount,currency,donation_date,payment_method,receipt_number,status,show_donor_publicly,campaign:fundraising_campaigns(title)")
    .order("donation_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.status) request = request.eq("status", params.status);
  const { data: donations } = await request;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Fundraising"
        title="Donation ledger"
        description="Record offline donations, verify them and control what contributes to public campaign totals."
        action={
          <Link
            href="/admin/fundraising/donations/new"
            className="inline-flex items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white"
          >
            Record donation <ArrowUpRight size={15} />
          </Link>
        }
      />

      {params.saved ? <Notice>Donation saved.</Notice> : null}
      {params.updated ? <Notice>Donation status updated.</Notice> : null}
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {["", "pending", "verified", "rejected", "refunded"].map((status) => (
          <Link
            key={status || "all"}
            href={status ? `/admin/fundraising/donations?status=${status}` : "/admin/fundraising/donations"}
            className={`rounded-full px-4 py-2 text-xs font-extrabold capitalize ${
              params.status === status || (!params.status && !status)
                ? "bg-poem-950 text-white"
                : "border border-black/10 bg-white text-poem-900"
            }`}
          >
            {status ? status : "All"}
          </Link>
        ))}
      </div>

      <div className="mt-7 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white">
        <div className="divide-y divide-black/5">
          {(donations ?? []).map((donation) => {
            const campaignRelation = donation.campaign as unknown as
              | { title: string }
              | { title: string }[]
              | null;
            const campaign = Array.isArray(campaignRelation)
              ? campaignRelation[0] ?? null
              : campaignRelation;

            return (
              <div key={donation.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <Link
                  href={`/admin/fundraising/donations/${donation.id}`}
                  className="flex items-start gap-4"
                >
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-poem-soft text-poem-900">
                    <CircleDollarSign size={18} />
                  </div>
                  <div>
                    <p className="font-extrabold text-poem-950">
                      {donation.donor_name || "Anonymous donor"}
                    </p>
                    <p className="mt-1 text-xs text-poem-muted">
                      {campaign?.title || "Campaign"} · {new Date(`${donation.donation_date}T00:00:00`).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-sm font-extrabold text-poem-900">
                      {formatFundraisingMoney(Number(donation.amount), donation.currency)}
                    </p>
                  </div>
                </Link>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <span className="rounded-full bg-poem-soft px-3 py-2 text-[10px] font-extrabold uppercase text-poem-800">
                    {donation.status}
                  </span>
                  {donation.status !== "verified" ? (
                    <form action={setFundraisingDonationStatus}>
                      <input type="hidden" name="id" value={donation.id} />
                      <input type="hidden" name="status" value="verified" />
                      <input type="hidden" name="return_to" value="/admin/fundraising/donations" />
                      <button className="rounded-full bg-poem-950 px-4 py-2 text-xs font-extrabold text-white">
                        Verify
                      </button>
                    </form>
                  ) : null}
                  {donation.status === "verified" ? (
                    <form action={setFundraisingDonationStatus}>
                      <input type="hidden" name="id" value={donation.id} />
                      <input type="hidden" name="status" value="refunded" />
                      <input type="hidden" name="return_to" value="/admin/fundraising/donations" />
                      <button className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-extrabold text-red-700">
                        Mark refunded
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            );
          })}

          {!donations?.length ? (
            <p className="p-8 text-center text-sm text-poem-muted">No donation records found.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
