import { Users } from "lucide-react";
import {
  programs as staticPrograms,
  projects as staticProjects,
} from "@/lib/site-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const accents = [
  "from-[#dce8c6] to-[#afcda9]",
  "from-[#eadfc9] to-[#d3b990]",
  "from-[#d1e4df] to-[#8eb9ad]",
  "from-[#d9e0ef] to-[#aebbd5]",
];

export async function getPublicPrograms() {
  if (!isSupabaseConfigured()) return staticPrograms;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("programs")
      .select(
        "id,slug,title,short_title,summary,description,focus,display_order,published",
      )
      .eq("published", true)
      .order("display_order");

    if (error || !data?.length) return staticPrograms;

    return data.map((row) => {
      const fallback = staticPrograms.find((item) => item.slug === row.slug);

      return {
        slug: row.slug,
        title: row.title,
        shortTitle: row.short_title,
        summary: row.summary,
        description: row.description,
        focus: row.focus ?? [],
        icon: fallback?.icon ?? Users,
      };
    });
  } catch {
    return staticPrograms;
  }
}

export async function getPublicProjects() {
  if (!isSupabaseConfigured()) return staticProjects;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id,slug,title,category,summary,challenge,response,outcomes,status,location,district,province,featured,published,project_sdgs(sdg_code)",
      )
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data?.length) return staticProjects;

    return data.map((row, index) => ({
      slug: row.slug,
      title: row.title,
      category: row.category,
      location: row.location,
      status: row.status === "active" ? "Active" : row.status,
      summary: row.summary,
      challenge: row.challenge,
      response: row.response,
      outcomes: row.outcomes ?? [],
      sdgs: (row.project_sdgs ?? []).map((item) => item.sdg_code),
      accent: accents[index % accents.length],
    }));
  } catch {
    return staticProjects;
  }
}

export async function getPublicProjectBySlug(slug: string) {
  if (!isSupabaseConfigured()) {
    return staticProjects.find((project) => project.slug === slug) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id,slug,title,category,summary,challenge,response,outcomes,status,location,district,province,featured,published,project_sdgs(sdg_code)",
      )
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error || !data) {
      return staticProjects.find((project) => project.slug === slug) ?? null;
    }

    return {
      slug: data.slug,
      title: data.title,
      category: data.category,
      location: data.location,
      status: data.status === "active" ? "Active" : data.status,
      summary: data.summary,
      challenge: data.challenge,
      response: data.response,
      outcomes: data.outcomes ?? [],
      sdgs: (data.project_sdgs ?? []).map((item) => item.sdg_code),
      accent: "from-[#dce8c6] to-[#afcda9]",
    };
  } catch {
    return staticProjects.find((project) => project.slug === slug) ?? null;
  }
}
