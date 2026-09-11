"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSiteAdmin } from "@/lib/admin/auth";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(message: string): never {
  redirect(
    `/admin/settings?error=${encodeURIComponent(message)}`,
  );
}

function isInternalPath(value: string) {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
  );
}

function isSafeHttpsUrl(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function saveSiteSettings(
  formData: FormData,
) {
  const { supabase } = await requireSiteAdmin();

  const payload = {
    organization_name: value(
      formData,
      "organization_name",
    ),
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
    homepage_eyebrow: value(
      formData,
      "homepage_eyebrow",
    ),
    homepage_title: value(
      formData,
      "homepage_title",
    ),
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
    seo_description: value(
      formData,
      "seo_description",
    ),
  };

  if (
    !payload.organization_name ||
    !payload.short_name
  ) {
    fail(
      "Organization name and short name are required.",
    );
  }

  if (
    payload.organization_name.length > 180 ||
    payload.short_name.length > 30 ||
    payload.tagline.length > 240 ||
    payload.phone.length > 60 ||
    payload.email.length > 254
  ) {
    fail("One or more settings exceed allowed length.");
  }

  if (
    payload.email &&
    !payload.email.includes("@")
  ) {
    fail("Enter a valid organization email.");
  }

  if (
    !isSafeHttpsUrl(payload.facebook_url) ||
    !isSafeHttpsUrl(payload.linkedin_url)
  ) {
    fail(
      "Social links must use secure https:// URLs.",
    );
  }

  if (
    !isInternalPath(payload.homepage_primary_href) ||
    !isInternalPath(payload.homepage_secondary_href)
  ) {
    fail(
      "Homepage CTA links must be internal paths beginning with /.",
    );
  }

  const { error } = await supabase
    .from("site_content_settings")
    .update(payload)
    .eq("id", 1);

  if (error) {
    console.error(
      "Site settings update failed:",
      error.message,
    );
    fail("Site settings could not be saved.");
  }

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/donate");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
