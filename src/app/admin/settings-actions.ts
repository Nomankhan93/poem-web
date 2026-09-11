"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSiteAdmin } from "@/lib/admin/auth";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function saveSiteSettings(formData: FormData) {
  const { supabase } = await requireSiteAdmin();

  const payload = {
    organization_name: value(formData, "organization_name"),
    short_name: value(formData, "short_name"),
    tagline: value(formData, "tagline"),
    address: value(formData, "address"),
    city: value(formData, "city"),
    province: value(formData, "province"),
    country: value(formData, "country"),
    phone: value(formData, "phone"),
    email: value(formData, "email"),
    facebook_url: value(formData, "facebook_url"),
    linkedin_url: value(formData, "linkedin_url"),
    donation_instructions: value(
      formData,
      "donation_instructions",
    ),
    homepage_eyebrow: value(formData, "homepage_eyebrow"),
    homepage_title: value(formData, "homepage_title"),
    homepage_description: value(
      formData,
      "homepage_description",
    ),
    homepage_primary_label: value(
      formData,
      "homepage_primary_label",
    ),
    homepage_primary_href: value(
      formData,
      "homepage_primary_href",
    ),
    homepage_secondary_label: value(
      formData,
      "homepage_secondary_label",
    ),
    homepage_secondary_href: value(
      formData,
      "homepage_secondary_href",
    ),
    seo_title: value(formData, "seo_title"),
    seo_description: value(formData, "seo_description"),
  };

  if (!payload.organization_name || !payload.short_name) {
    redirect(
      "/admin/settings?error=Organization%20name%20and%20short%20name%20are%20required.",
    );
  }

  const { error } = await supabase
    .from("site_content_settings")
    .update(payload)
    .eq("id", 1);

  if (error) {
    redirect(
      `/admin/settings?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/donate");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
