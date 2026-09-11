import { Users } from "lucide-react";
import { programs as staticPrograms, projects as staticProjects } from "@/lib/site-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { MediaAsset } from "@/lib/media";

const accents = [
  "from-[#dce8c6] to-[#afcda9]",
  "from-[#eadfc9] to-[#d3b990]",
  "from-[#d1e4df] to-[#8eb9ad]",
  "from-[#d9e0ef] to-[#aebbd5]",
];

function publicUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  asset?: Pick<MediaAsset, "bucket" | "path"> | null,
) {
  if (!asset) return null;
  return supabase.storage.from(asset.bucket).getPublicUrl(asset.path).data.publicUrl;
}

export async function getPublicPrograms() {
  if (!isSupabaseConfigured()) return staticPrograms;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("programs")
      .select("id,slug,title,short_title,summary,description,focus,display_order,published")
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
        focus: (row.focus ?? []) as string[],
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
      .select("id,slug,title,category,summary,challenge,response,outcomes,status,location,district,province,featured,published,project_sdgs(sdg_code)")
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
      outcomes: (row.outcomes ?? []) as string[],
      sdgs: (row.project_sdgs ?? []).map((item: { sdg_code: string }) => item.sdg_code),
      accent: accents[index % accents.length],
    }));
  } catch {
    return staticProjects;
  }
}

export async function getPublicProjectBySlug(slug: string) {
  const staticFallback = staticProjects.find((project) => project.slug === slug) ?? null;

  if (!isSupabaseConfigured()) {
    return staticFallback
      ? { ...staticFallback, donorPartner: "", coverUrl: null, gallery: [], reports: [], featuredStory: null }
      : null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id,slug,title,category,summary,challenge,response,outcomes,status,location,district,province,featured,published,donor_partner,featured_story_id,project_sdgs(sdg_code)")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error || !data) {
      return staticFallback
        ? { ...staticFallback, donorPartner: "", coverUrl: null, gallery: [], reports: [], featuredStory: null }
        : null;
    }

    const mediaResult = await supabase
      .from("project_media")
      .select("id,role,display_order,media_assets(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)")
      .eq("project_id", data.id)
      .order("display_order");

    const reportsResult = await supabase
      .from("resources")
      .select("id,slug,title,category,year,description,pdf_asset:media_assets!resources_pdf_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)")
      .eq("project_id", data.id)
      .eq("published", true)
      .order("year", { ascending: false });

    let featuredStoryRow = null;
    if (data.featured_story_id) {
      const result = await supabase
        .from("stories")
        .select("id,slug,title,excerpt,person_name,location,cover_asset:media_assets!stories_cover_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)")
        .eq("id", data.featured_story_id)
        .eq("published", true)
        .maybeSingle();
      featuredStoryRow = result.data;
    }

    const media = (mediaResult.data ?? []).flatMap((row) => {
      const asset = row.media_assets as unknown as MediaAsset | null;
      if (!asset) return [];
      return [{
        id: row.id,
        role: row.role,
        displayOrder: row.display_order,
        altText: asset.alt_text,
        caption: asset.caption,
        url: publicUrl(supabase, asset),
      }];
    });

    const cover = media.find((item) => item.role === "cover");
    const gallery = media.filter((item) => item.role === "gallery");

    const reports = (reportsResult.data ?? []).map((row) => {
      const asset = row.pdf_asset as unknown as MediaAsset | null;
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        year: row.year,
        description: row.description,
        downloadUrl: publicUrl(supabase, asset),
        fileName: asset?.file_name ?? "",
        fileSize: asset?.size_bytes ?? 0,
      };
    });

    let featuredStory = null;
    if (featuredStoryRow) {
      const asset = featuredStoryRow.cover_asset as unknown as MediaAsset | null;
      featuredStory = {
        slug: featuredStoryRow.slug,
        title: featuredStoryRow.title,
        excerpt: featuredStoryRow.excerpt,
        personName: featuredStoryRow.person_name,
        location: featuredStoryRow.location,
        coverUrl: publicUrl(supabase, asset),
      };
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
      outcomes: (data.outcomes ?? []) as string[],
      sdgs: (data.project_sdgs ?? []).map((item: { sdg_code: string }) => item.sdg_code),
      accent: "from-[#dce8c6] to-[#afcda9]",
      donorPartner: data.donor_partner,
      coverUrl: cover?.url ?? null,
      gallery,
      reports,
      featuredStory,
    };
  } catch {
    return staticFallback
      ? { ...staticFallback, donorPartner: "", coverUrl: null, gallery: [], reports: [], featuredStory: null }
      : null;
  }
}

export async function getPublicResources() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("id,slug,title,category,year,description,featured,published,pdf_asset:media_assets!resources_pdf_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption),cover_asset:media_assets!resources_cover_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return [];

  return (data ?? []).map((row) => {
    const pdf = row.pdf_asset as unknown as MediaAsset | null;
    const cover = row.cover_asset as unknown as MediaAsset | null;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: row.category,
      year: row.year,
      description: row.description,
      featured: row.featured,
      downloadUrl: publicUrl(supabase, pdf),
      fileName: pdf?.file_name ?? "",
      fileSize: pdf?.size_bytes ?? 0,
      coverUrl: publicUrl(supabase, cover),
      coverAlt: cover?.alt_text ?? "",
    };
  });
}

export async function getPublicResourceBySlug(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("id,slug,title,category,year,description,featured,published,project:projects(id,slug,title),pdf_asset:media_assets!resources_pdf_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption),cover_asset:media_assets!resources_cover_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;

  const pdf = data.pdf_asset as unknown as MediaAsset | null;
  const cover = data.cover_asset as unknown as MediaAsset | null;
  return {
    ...data,
    downloadUrl: publicUrl(supabase, pdf),
    fileName: pdf?.file_name ?? "",
    fileSize: pdf?.size_bytes ?? 0,
    coverUrl: publicUrl(supabase, cover),
    coverAlt: cover?.alt_text ?? "",
  };
}

export async function getPublicStories() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .select("id,slug,title,excerpt,person_name,location,featured,published,cover_asset:media_assets!stories_cover_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return [];

  return (data ?? []).map((row) => {
    const cover = row.cover_asset as unknown as MediaAsset | null;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      personName: row.person_name,
      location: row.location,
      featured: row.featured,
      coverUrl: publicUrl(supabase, cover),
      coverAlt: cover?.alt_text ?? "",
    };
  });
}

export async function getPublicStoryBySlug(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .select("id,slug,title,excerpt,body,person_name,location,featured,published,project:projects(id,slug,title),cover_asset:media_assets!stories_cover_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;

  const { data: galleryRows } = await supabase
    .from("story_media")
    .select("id,display_order,media_assets(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)")
    .eq("story_id", data.id)
    .order("display_order");

  const cover = data.cover_asset as unknown as MediaAsset | null;
  const gallery = (galleryRows ?? []).flatMap((row) => {
    const asset = row.media_assets as unknown as MediaAsset | null;
    if (!asset) return [];
    return [{
      id: row.id,
      url: publicUrl(supabase, asset),
      altText: asset.alt_text,
      caption: asset.caption,
    }];
  });

  const projectRelation = data.project as unknown as
    | {
        id: string;
        slug: string;
        title: string;
      }
    | {
        id: string;
        slug: string;
        title: string;
      }[]
    | null;

  const project = Array.isArray(projectRelation)
    ? projectRelation[0] ?? null
    : projectRelation;

  return {
    ...data,
    project,
    coverUrl: publicUrl(supabase, cover),
    coverAlt: cover?.alt_text ?? "",
    gallery,
  };
}
