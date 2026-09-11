import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type SiteContentSettings = {
  organization_name: string;
  short_name: string;
  tagline: string;
  address: string;
  city: string;
  province: string;
  country: string;
  phone: string;
  email: string;
  facebook_url: string;
  linkedin_url: string;
  donation_instructions: string;
  homepage_eyebrow: string;
  homepage_title: string;
  homepage_description: string;
  homepage_primary_label: string;
  homepage_primary_href: string;
  homepage_secondary_label: string;
  homepage_secondary_href: string;
  seo_title: string;
  seo_description: string;
};

export const defaultSiteSettings: SiteContentSettings = {
  organization_name:
    "Participatory Organization for Empowering Marginalized",
  short_name: "POEM",
  tagline: "Communities leading change.",
  address: "",
  city: "Mirpurkhas",
  province: "Sindh",
  country: "Pakistan",
  phone: "",
  email: "",
  facebook_url: "",
  linkedin_url: "",
  donation_instructions: "",
  homepage_eyebrow: "Participatory development",
  homepage_title: "Communities leading change.",
  homepage_description:
    "POEM works alongside marginalized communities to strengthen opportunity, resilience and participation.",
  homepage_primary_label: "Explore our work",
  homepage_primary_href: "/projects",
  homepage_secondary_label: "About POEM",
  homepage_secondary_href: "/about",
  seo_title: "POEM Pakistan",
  seo_description:
    "Participatory Organization for Empowering Marginalized — Pakistan.",
};

export async function getSiteSettings(): Promise<SiteContentSettings> {
  if (!isSupabaseConfigured()) return defaultSiteSettings;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_content_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return defaultSiteSettings;

    return {
      organization_name: data.organization_name,
      short_name: data.short_name,
      tagline: data.tagline,
      address: data.address,
      city: data.city,
      province: data.province,
      country: data.country,
      phone: data.phone,
      email: data.email,
      facebook_url: data.facebook_url,
      linkedin_url: data.linkedin_url,
      donation_instructions: data.donation_instructions,
      homepage_eyebrow: data.homepage_eyebrow,
      homepage_title: data.homepage_title,
      homepage_description: data.homepage_description,
      homepage_primary_label: data.homepage_primary_label,
      homepage_primary_href: data.homepage_primary_href,
      homepage_secondary_label: data.homepage_secondary_label,
      homepage_secondary_href: data.homepage_secondary_href,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
    };
  } catch {
    return defaultSiteSettings;
  }
}
