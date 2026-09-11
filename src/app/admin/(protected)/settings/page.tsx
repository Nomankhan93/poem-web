import {
  AdminPageHeader,
  Notice,
} from "@/components/admin/admin-ui";
import { saveSiteSettings } from "@/app/admin/settings-actions";
import { requireSiteAdmin } from "@/lib/admin/auth";

const input =
  "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-poem-700";
const label = "text-sm font-bold text-poem-900";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireSiteAdmin();

  const { data: settings } = await supabase
    .from("site_content_settings")
    .select("*")
    .eq("id", 1)
    .single();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Organization"
        title="Site settings"
        description="Manage POEM contact details, homepage messaging and default SEO content."
      />

      {params.saved ? (
        <Notice>Site settings saved successfully.</Notice>
      ) : null}
      {params.error ? (
        <Notice tone="error">{params.error}</Notice>
      ) : null}

      <form action={saveSiteSettings} className="mt-7 space-y-6">
        <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
          <h2 className="text-lg font-extrabold text-poem-950">
            Organization
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className={label}>
              Organization name *
              <input
                name="organization_name"
                required
                defaultValue={settings?.organization_name}
                className={input}
              />
            </label>

            <label className={label}>
              Short name *
              <input
                name="short_name"
                required
                defaultValue={settings?.short_name}
                className={input}
              />
            </label>

            <label className={`${label} md:col-span-2`}>
              Tagline
              <input
                name="tagline"
                defaultValue={settings?.tagline}
                className={input}
              />
            </label>

            <label className={`${label} md:col-span-2`}>
              Address
              <input
                name="address"
                defaultValue={settings?.address}
                className={input}
              />
            </label>

            <label className={label}>
              City
              <input
                name="city"
                defaultValue={settings?.city}
                className={input}
              />
            </label>

            <label className={label}>
              Province
              <input
                name="province"
                defaultValue={settings?.province}
                className={input}
              />
            </label>

            <label className={label}>
              Country
              <input
                name="country"
                defaultValue={settings?.country}
                className={input}
              />
            </label>

            <label className={label}>
              Phone
              <input
                name="phone"
                defaultValue={settings?.phone}
                className={input}
              />
            </label>

            <label className={label}>
              Email
              <input
                name="email"
                type="email"
                defaultValue={settings?.email}
                className={input}
              />
            </label>

            <label className={label}>
              Facebook URL
              <input
                name="facebook_url"
                type="url"
                defaultValue={settings?.facebook_url}
                className={input}
              />
            </label>

            <label className={label}>
              LinkedIn URL
              <input
                name="linkedin_url"
                type="url"
                defaultValue={settings?.linkedin_url}
                className={input}
              />
            </label>
          </div>

          <label className={`${label} mt-5 block`}>
            Donation instructions
            <textarea
              name="donation_instructions"
              rows={5}
              defaultValue={settings?.donation_instructions}
              className={input}
              placeholder="Only add verified banking or donation instructions."
            />
          </label>
        </section>

        <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
          <h2 className="text-lg font-extrabold text-poem-950">
            Homepage hero
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className={`${label} md:col-span-2`}>
              Eyebrow
              <input
                name="homepage_eyebrow"
                defaultValue={settings?.homepage_eyebrow}
                className={input}
              />
            </label>

            <label className={`${label} md:col-span-2`}>
              Main title
              <input
                name="homepage_title"
                defaultValue={settings?.homepage_title}
                className={input}
              />
            </label>

            <label className={`${label} md:col-span-2`}>
              Description
              <textarea
                name="homepage_description"
                rows={4}
                defaultValue={settings?.homepage_description}
                className={input}
              />
            </label>

            <label className={label}>
              Primary CTA label
              <input
                name="homepage_primary_label"
                defaultValue={settings?.homepage_primary_label}
                className={input}
              />
            </label>

            <label className={label}>
              Primary CTA href
              <input
                name="homepage_primary_href"
                defaultValue={settings?.homepage_primary_href}
                className={input}
              />
            </label>

            <label className={label}>
              Secondary CTA label
              <input
                name="homepage_secondary_label"
                defaultValue={settings?.homepage_secondary_label}
                className={input}
              />
            </label>

            <label className={label}>
              Secondary CTA href
              <input
                name="homepage_secondary_href"
                defaultValue={settings?.homepage_secondary_href}
                className={input}
              />
            </label>
          </div>
        </section>

        <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
          <h2 className="text-lg font-extrabold text-poem-950">
            Default SEO
          </h2>

          <label className={`${label} mt-5 block`}>
            SEO title
            <input
              name="seo_title"
              defaultValue={settings?.seo_title}
              className={input}
            />
          </label>

          <label className={`${label} mt-5 block`}>
            SEO description
            <textarea
              name="seo_description"
              rows={4}
              defaultValue={settings?.seo_description}
              className={input}
            />
          </label>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-poem-950 px-7 py-3 text-sm font-extrabold text-white"
          >
            Save site settings
          </button>
        </div>
      </form>
    </div>
  );
}
