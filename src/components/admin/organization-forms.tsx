import Link from "next/link";
import {
  saveCareer,
  saveNews,
  savePartner,
  saveTeamMember,
  saveTender,
} from "@/app/admin/organization-actions";
import { AssetUploadField } from "@/components/admin/asset-upload-field";

const input =
  "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-poem-700";
const label = "text-sm font-bold text-poem-900";

export function PartnerForm({ partner }: { partner?: Record<string, unknown> }) {
  return (
    <form action={savePartner} className="space-y-6">
      {partner?.id ? <input type="hidden" name="id" value={String(partner.id)} /> : null}

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={label}>
            Name *
            <input name="name" required defaultValue={String(partner?.name ?? "")} className={input} />
          </label>
          <label className={label}>
            Slug *
            <input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={String(partner?.slug ?? "")} className={input} />
          </label>
          <label className={label}>
            Partner type
            <select name="partner_type" defaultValue={String(partner?.partner_type ?? "partner")} className={input}>
              <option value="donor">Donor</option>
              <option value="government">Government</option>
              <option value="ngo">NGO</option>
              <option value="ingo">INGO</option>
              <option value="corporate">Corporate</option>
              <option value="academic">Academic</option>
              <option value="network">Network</option>
              <option value="partner">Partner</option>
            </select>
          </label>
          <label className={label}>
            Website
            <input name="website_url" type="url" defaultValue={String(partner?.website_url ?? "")} className={input} />
          </label>
          <label className={label}>
            Display order
            <input name="display_order" type="number" defaultValue={String(partner?.display_order ?? 0)} className={input} />
          </label>
        </div>

        <label className={`${label} mt-5 block`}>
          Description
          <textarea name="description" rows={5} defaultValue={String(partner?.description ?? "")} className={input} />
        </label>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <AssetUploadField
          name="logo_asset_id"
          bucket="partners"
          label="Partner logo"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          prefix="logos"
          existingAsset={(partner?.logo_asset as { id: string; file_name: string } | null) ?? null}
        />
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
            <input type="checkbox" name="featured" defaultChecked={Boolean(partner?.featured)} className="size-4 accent-poem-900" />
            Featured
          </label>
          <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
            <input type="checkbox" name="published" defaultChecked={Boolean(partner?.published)} className="size-4 accent-poem-900" />
            Published
          </label>
        </div>
      </section>

      <FormButtons back="/admin/partners" existing={Boolean(partner?.id)} />
    </form>
  );
}

export function TeamForm({ member }: { member?: Record<string, unknown> }) {
  return (
    <form action={saveTeamMember} className="space-y-6">
      {member?.id ? <input type="hidden" name="id" value={String(member.id)} /> : null}

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={label}>
            Name *
            <input name="name" required defaultValue={String(member?.name ?? "")} className={input} />
          </label>
          <label className={label}>
            Role / designation *
            <input name="role_title" required defaultValue={String(member?.role_title ?? "")} className={input} />
          </label>
          <label className={label}>
            Type
            <select name="member_type" defaultValue={String(member?.member_type ?? "team")} className={input}>
              <option value="team">Team</option>
              <option value="board">Board</option>
              <option value="advisor">Advisor</option>
            </select>
          </label>
          <label className={label}>
            Display order
            <input name="display_order" type="number" defaultValue={String(member?.display_order ?? 0)} className={input} />
          </label>
          <label className={label}>
            Email
            <input name="email" type="email" defaultValue={String(member?.email ?? "")} className={input} />
          </label>
          <label className={label}>
            LinkedIn URL
            <input name="linkedin_url" type="url" defaultValue={String(member?.linkedin_url ?? "")} className={input} />
          </label>
        </div>

        <label className={`${label} mt-5 block`}>
          Biography
          <textarea name="bio" rows={7} defaultValue={String(member?.bio ?? "")} className={input} />
        </label>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <AssetUploadField
          name="photo_asset_id"
          bucket="team"
          label="Profile photo"
          accept="image/jpeg,image/png,image/webp"
          prefix="profiles"
          existingAsset={(member?.photo_asset as { id: string; file_name: string } | null) ?? null}
        />
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6">
        <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
          <input type="checkbox" name="published" defaultChecked={Boolean(member?.published)} className="size-4 accent-poem-900" />
          Published
        </label>
      </section>

      <FormButtons back="/admin/team" existing={Boolean(member?.id)} />
    </form>
  );
}

export function NewsForm({ post }: { post?: Record<string, unknown> }) {
  return (
    <form action={saveNews} className="space-y-6">
      {post?.id ? <input type="hidden" name="id" value={String(post.id)} /> : null}

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={label}>
            Title *
            <input name="title" required defaultValue={String(post?.title ?? "")} className={input} />
          </label>
          <label className={label}>
            Slug *
            <input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={String(post?.slug ?? "")} className={input} />
          </label>
          <label className={label}>
            Category
            <select name="category" defaultValue={String(post?.category ?? "update")} className={input}>
              <option value="update">Update</option>
              <option value="event">Event</option>
              <option value="announcement">Announcement</option>
              <option value="press-release">Press Release</option>
            </select>
          </label>
        </div>

        <label className={`${label} mt-5 block`}>
          Excerpt
          <textarea name="excerpt" rows={3} defaultValue={String(post?.excerpt ?? "")} className={input} />
        </label>

        <label className={`${label} mt-5 block`}>
          Article
          <textarea name="body" rows={14} defaultValue={String(post?.body ?? "")} className={input} />
        </label>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <AssetUploadField
          name="cover_asset_id"
          bucket="project-media"
          label="News cover image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          prefix="news-covers"
          existingAsset={(post?.cover_asset as { id: string; file_name: string } | null) ?? null}
        />
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
            <input type="checkbox" name="featured" defaultChecked={Boolean(post?.featured)} className="size-4 accent-poem-900" />
            Featured
          </label>
          <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
            <input type="checkbox" name="published" defaultChecked={Boolean(post?.published)} className="size-4 accent-poem-900" />
            Published
          </label>
        </div>
      </section>

      <FormButtons back="/admin/news" existing={Boolean(post?.id)} />
    </form>
  );
}

export function CareerForm({ career }: { career?: Record<string, unknown> }) {
  return (
    <form action={saveCareer} className="space-y-6">
      {career?.id ? <input type="hidden" name="id" value={String(career.id)} /> : null}

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={label}>
            Job title *
            <input name="title" required defaultValue={String(career?.title ?? "")} className={input} />
          </label>
          <label className={label}>
            Slug *
            <input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={String(career?.slug ?? "")} className={input} />
          </label>
          <label className={label}>
            Department
            <input name="department" defaultValue={String(career?.department ?? "")} className={input} />
          </label>
          <label className={label}>
            Location
            <input name="location" defaultValue={String(career?.location ?? "")} className={input} />
          </label>
          <label className={label}>
            Employment type
            <input name="employment_type" defaultValue={String(career?.employment_type ?? "Full-time")} className={input} />
          </label>
          <label className={label}>
            Deadline
            <input name="deadline" type="datetime-local" defaultValue={dateTimeLocal(career?.deadline)} className={input} />
          </label>
          <label className={label}>
            Status
            <select name="status" defaultValue={String(career?.status ?? "draft")} className={input}>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className={label}>
            External apply URL
            <input name="apply_url" type="url" defaultValue={String(career?.apply_url ?? "")} className={input} />
          </label>
        </div>

        <label className={`${label} mt-5 block`}>
          Summary
          <textarea name="summary" rows={3} defaultValue={String(career?.summary ?? "")} className={input} />
        </label>
        <label className={`${label} mt-5 block`}>
          Description
          <textarea name="description" rows={8} defaultValue={String(career?.description ?? "")} className={input} />
        </label>
        <label className={`${label} mt-5 block`}>
          Requirements
          <textarea name="requirements" rows={7} defaultValue={String(career?.requirements ?? "")} className={input} />
        </label>
        <label className={`${label} mt-5 block`}>
          Application instructions
          <textarea name="apply_instructions" rows={5} defaultValue={String(career?.apply_instructions ?? "")} className={input} />
        </label>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6">
        <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
          <input type="checkbox" name="published" defaultChecked={Boolean(career?.published)} className="size-4 accent-poem-900" />
          Published
        </label>
      </section>

      <FormButtons back="/admin/careers" existing={Boolean(career?.id)} />
    </form>
  );
}

export function TenderForm({ tender }: { tender?: Record<string, unknown> }) {
  return (
    <form action={saveTender} className="space-y-6">
      {tender?.id ? <input type="hidden" name="id" value={String(tender.id)} /> : null}

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={label}>
            Tender title *
            <input name="title" required defaultValue={String(tender?.title ?? "")} className={input} />
          </label>
          <label className={label}>
            Slug *
            <input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={String(tender?.slug ?? "")} className={input} />
          </label>
          <label className={label}>
            Reference number
            <input name="reference_number" defaultValue={String(tender?.reference_number ?? "")} className={input} />
          </label>
          <label className={label}>
            Issue date
            <input name="issue_date" type="date" defaultValue={String(tender?.issue_date ?? "")} className={input} />
          </label>
          <label className={label}>
            Deadline
            <input name="deadline" type="datetime-local" defaultValue={dateTimeLocal(tender?.deadline)} className={input} />
          </label>
          <label className={label}>
            Status
            <select name="status" defaultValue={String(tender?.status ?? "draft")} className={input}>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>

        <label className={`${label} mt-5 block`}>
          Summary
          <textarea name="summary" rows={3} defaultValue={String(tender?.summary ?? "")} className={input} />
        </label>

        <label className={`${label} mt-5 block`}>
          Description / TOR summary
          <textarea name="description" rows={9} defaultValue={String(tender?.description ?? "")} className={input} />
        </label>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <AssetUploadField
          name="document_asset_id"
          bucket="documents"
          label="Tender PDF / TOR"
          accept="application/pdf"
          prefix="tenders"
          existingAsset={(tender?.document_asset as { id: string; file_name: string } | null) ?? null}
        />
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6">
        <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
          <input type="checkbox" name="published" defaultChecked={Boolean(tender?.published)} className="size-4 accent-poem-900" />
          Published
        </label>
      </section>

      <FormButtons back="/admin/tenders" existing={Boolean(tender?.id)} />
    </form>
  );
}

function FormButtons({ back, existing }: { back: string; existing: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Link href={back} className="rounded-full border border-black/10 px-6 py-3 text-center text-sm font-extrabold text-poem-900">
        Cancel
      </Link>
      <button type="submit" className="rounded-full bg-poem-950 px-7 py-3 text-sm font-extrabold text-white">
        {existing ? "Save changes" : "Create"}
      </button>
    </div>
  );
}

function dateTimeLocal(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
