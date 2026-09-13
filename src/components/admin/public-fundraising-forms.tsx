import Link from "next/link";
import {
  saveFundraisingCampaign,
  saveFundraisingDonation,
  saveProjectFundingProfile,
} from "@/app/admin/fundraising-public-actions";
import { AssetUploadField } from "@/components/admin/asset-upload-field";

const input =
  "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-poem-700";
const label = "text-sm font-bold text-poem-900";

type Option = { id: string; label: string };

function Buttons({ back, existing }: { back: string; existing: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Link
        href={back}
        className="rounded-full border border-black/10 px-6 py-3 text-center text-sm font-extrabold text-poem-900"
      >
        Cancel
      </Link>
      <button
        type="submit"
        className="rounded-full bg-poem-950 px-7 py-3 text-sm font-extrabold text-white"
      >
        {existing ? "Save changes" : "Create"}
      </button>
    </div>
  );
}

export function ProjectFundingForm({
  project,
  profile,
}: {
  project: { id: string; slug: string; title: string };
  profile?: Record<string, unknown> | null;
}) {
  return (
    <form action={saveProjectFundingProfile} className="space-y-6">
      <input type="hidden" name="project_id" value={project.id} />
      <input type="hidden" name="project_slug" value={project.slug} />

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">{project.title}</h2>
        <p className="mt-2 text-sm text-poem-muted">
          Set the project funding target and control whether its combined funding progress is public.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className={label}>
            Funding target
            <input
              name="funding_target"
              type="number"
              min="0"
              step="0.01"
              defaultValue={String(profile?.funding_target ?? 0)}
              className={input}
            />
          </label>

          <label className={label}>
            Currency
            <input
              name="currency"
              maxLength={3}
              defaultValue={String(profile?.currency ?? "PKR")}
              className={input}
            />
          </label>

          <label className={label}>
            Fundraising status
            <select
              name="fundraising_status"
              defaultValue={String(profile?.fundraising_status ?? "seeking")}
              className={input}
            >
              <option value="seeking">Seeking funding</option>
              <option value="partially_funded">Partially funded</option>
              <option value="fully_funded">Fully funded</option>
              <option value="closed">Funding closed</option>
            </select>
          </label>

          <label className={label}>
            Funding deadline
            <input
              name="funding_deadline"
              type="date"
              defaultValue={String(profile?.funding_deadline ?? "")}
              className={input}
            />
          </label>
        </div>

        <label className={`${label} mt-5 block`}>
          Public funding summary
          <textarea
            name="public_summary"
            rows={5}
            defaultValue={String(profile?.public_summary ?? "")}
            className={input}
            placeholder="Explain why the project is seeking support and what additional funding will enable."
          />
        </label>

        <label className="mt-6 flex items-center gap-3 text-sm font-bold text-poem-900">
          <input
            type="checkbox"
            name="public_fundraising_enabled"
            defaultChecked={Boolean(profile?.public_fundraising_enabled)}
            className="size-4 accent-poem-900"
          />
          Show this project&apos;s funding progress publicly
        </label>
      </section>

      <Buttons back="/admin/fundraising/projects" existing={Boolean(profile?.id)} />
    </form>
  );
}

export function CampaignForm({
  campaign,
  projects,
  programs,
}: {
  campaign?: Record<string, unknown>;
  projects: Option[];
  programs: Option[];
}) {
  return (
    <form action={saveFundraisingCampaign} className="space-y-6">
      {campaign?.id ? (
        <input type="hidden" name="id" value={String(campaign.id)} />
      ) : null}

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">Campaign identity</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className={label}>
            Campaign title *
            <input
              name="title"
              required
              defaultValue={String(campaign?.title ?? "")}
              className={input}
            />
          </label>
          <label className={label}>
            Slug *
            <input
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              defaultValue={String(campaign?.slug ?? "")}
              className={input}
            />
          </label>
          <label className={label}>
            Related project
            <select
              name="project_id"
              defaultValue={String(campaign?.project_id ?? "")}
              className={input}
            >
              <option value="">No project selected</option>
              {projects.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className={label}>
            Related program
            <select
              name="program_id"
              defaultValue={String(campaign?.program_id ?? "")}
              className={input}
            >
              <option value="">No program selected</option>
              {programs.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className={label}>
            Category
            <input
              name="category"
              placeholder="Education, Health, Emergency..."
              defaultValue={String(campaign?.category ?? "")}
              className={input}
            />
          </label>
          <label className={label}>
            Location
            <input
              name="location"
              defaultValue={String(campaign?.location ?? "")}
              className={input}
            />
          </label>
        </div>

        <label className={`${label} mt-5 block`}>
          Short summary
          <textarea
            name="short_summary"
            rows={4}
            defaultValue={String(campaign?.short_summary ?? "")}
            className={input}
          />
        </label>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">Funding & timeline</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <label className={label}>
            Funding target
            <input
              name="funding_target"
              type="number"
              min="0"
              step="0.01"
              defaultValue={String(campaign?.funding_target ?? 0)}
              className={input}
            />
          </label>
          <label className={label}>
            Currency
            <input
              name="currency"
              maxLength={3}
              defaultValue={String(campaign?.currency ?? "PKR")}
              className={input}
            />
          </label>
          <label className={label}>
            Beneficiary target
            <input
              name="beneficiary_target"
              type="number"
              min="0"
              defaultValue={String(campaign?.beneficiary_target ?? "")}
              className={input}
            />
          </label>
          <label className={label}>
            Start date
            <input
              name="start_date"
              type="date"
              defaultValue={String(campaign?.start_date ?? "")}
              className={input}
            />
          </label>
          <label className={label}>
            End date
            <input
              name="end_date"
              type="date"
              defaultValue={String(campaign?.end_date ?? "")}
              className={input}
            />
          </label>
          <label className={label}>
            Status
            <select
              name="status"
              defaultValue={String(campaign?.status ?? "draft")}
              className={input}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">Campaign story</h2>
        <label className={`${label} mt-5 block`}>
          Full story / case for support
          <textarea
            name="story"
            rows={10}
            defaultValue={String(campaign?.story ?? "")}
            className={input}
          />
        </label>
        <label className={`${label} mt-5 block`}>
          Expected impact
          <textarea
            name="expected_impact"
            rows={6}
            defaultValue={String(campaign?.expected_impact ?? "")}
            className={input}
          />
        </label>
        <label className={`${label} mt-5 block`}>
          Donation instructions
          <textarea
            name="donation_instructions"
            rows={6}
            defaultValue={String(campaign?.donation_instructions ?? "")}
            className={input}
            placeholder="Add verified POEM bank-transfer or giving instructions for this campaign."
          />
        </label>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <AssetUploadField
          name="cover_asset_id"
          bucket="project-media"
          label="Campaign cover image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          prefix="fundraising-campaigns"
          existingAsset={
            (campaign?.cover_asset as { id: string; file_name: string } | null) ?? null
          }
        />
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={Boolean(campaign?.featured)}
              className="size-4 accent-poem-900"
            />
            Feature on homepage
          </label>
          <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
            <input
              type="checkbox"
              name="published"
              defaultChecked={Boolean(campaign?.published)}
              className="size-4 accent-poem-900"
            />
            Publish campaign
          </label>
        </div>
      </section>

      <Buttons back="/admin/fundraising/campaigns" existing={Boolean(campaign?.id)} />
    </form>
  );
}

export function DonationForm({
  donation,
  campaigns,
}: {
  donation?: Record<string, unknown>;
  campaigns: Array<Option & { currency: string }>;
}) {
  return (
    <form action={saveFundraisingDonation} className="space-y-6">
      {donation?.id ? (
        <input type="hidden" name="id" value={String(donation.id)} />
      ) : null}

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">Donation record</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className={label}>
            Campaign *
            <select
              name="campaign_id"
              required
              defaultValue={String(donation?.campaign_id ?? "")}
              className={input}
            >
              <option value="">Select campaign</option>
              {campaigns.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} · {item.currency}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Amount *
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              defaultValue={String(donation?.amount ?? "")}
              className={input}
            />
          </label>
          <label className={label}>
            Donor name
            <input
              name="donor_name"
              defaultValue={String(donation?.donor_name ?? "")}
              className={input}
            />
          </label>
          <label className={label}>
            Donor type
            <select
              name="donor_type"
              defaultValue={String(donation?.donor_type ?? "individual")}
              className={input}
            >
              <option value="individual">Individual</option>
              <option value="corporate">Corporate</option>
              <option value="foundation">Foundation</option>
              <option value="community">Community</option>
              <option value="anonymous">Anonymous</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className={label}>
            Donation date
            <input
              name="donation_date"
              type="date"
              defaultValue={String(
                donation?.donation_date ?? "",
              )}
              className={input}
            />
          </label>
          <label className={label}>
            Payment method
            <select
              name="payment_method"
              defaultValue={String(donation?.payment_method ?? "bank_transfer")}
              className={input}
            >
              <option value="bank_transfer">Bank transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="online_transfer">Online transfer</option>
              <option value="corporate_donation">Corporate donation</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className={label}>
            Transaction reference
            <input
              name="transaction_reference"
              defaultValue={String(donation?.transaction_reference ?? "")}
              className={input}
            />
          </label>
          <label className={label}>
            Receipt number
            <input
              name="receipt_number"
              defaultValue={String(donation?.receipt_number ?? "")}
              className={input}
            />
          </label>
          <label className={label}>
            Verification status
            <select
              name="status"
              defaultValue={String(donation?.status ?? "pending")}
              className={input}
            >
              <option value="pending">Pending verification</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>
        </div>

        <label className="mt-6 flex items-center gap-3 text-sm font-bold text-poem-900">
          <input
            type="checkbox"
            name="show_donor_publicly"
            defaultChecked={Boolean(donation?.show_donor_publicly)}
            className="size-4 accent-poem-900"
          />
          Show donor name publicly when this donation is verified
        </label>

        <label className={`${label} mt-5 block`}>
          Internal notes
          <textarea
            name="notes"
            rows={5}
            defaultValue={String(donation?.notes ?? "")}
            className={input}
          />
        </label>
      </section>

      <Buttons back="/admin/fundraising/donations" existing={Boolean(donation?.id)} />
    </form>
  );
}
