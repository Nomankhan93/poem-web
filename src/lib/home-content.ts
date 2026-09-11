import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { MediaAsset } from "@/lib/media";

type AssetRelation =
  | MediaAsset
  | MediaAsset[]
  | null
  | undefined;

function one<T>(relation: T | T[] | null | undefined): T | null {
  if (!relation) return null;
  return Array.isArray(relation)
    ? relation[0] ?? null
    : relation;
}

function assetUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  relation: AssetRelation,
) {
  const asset = one(relation);
  if (!asset) return null;

  return supabase.storage
    .from(asset.bucket)
    .getPublicUrl(asset.path).data.publicUrl;
}

export async function getHomepageContent() {
  if (!isSupabaseConfigured()) {
    return {
      projects: [],
      story: null,
      news: [],
      resources: [],
      partners: [],
    };
  }

  const supabase = await createClient();

  const [
    { data: projects },
    { data: storyRows },
    { data: newsRows },
    { data: resourceRows },
    { data: partnerRows },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id,slug,title,category,summary,location,featured",
      )
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("stories")
      .select(
        "id,slug,title,excerpt,person_name,location,cover_asset:media_assets!stories_cover_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)",
      )
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("published_at", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(1),
    supabase
      .from("news_posts")
      .select(
        "id,slug,title,excerpt,category,cover_asset:media_assets!news_posts_cover_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)",
      )
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("published_at", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(3),
    supabase
      .from("resources")
      .select(
        "id,slug,title,category,year,description",
      )
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("year", { ascending: false })
      .limit(3),
    supabase
      .from("partners")
      .select(
        "id,name,website_url,logo_asset:media_assets!partners_logo_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)",
      )
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("display_order")
      .limit(6),
  ]);

  const projectList = projects ?? [];
  const projectIds = projectList.map((project) => project.id);

  const { data: coverRows } = projectIds.length
    ? await supabase
        .from("project_media")
        .select(
          "project_id,media_assets(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)",
        )
        .in("project_id", projectIds)
        .eq("role", "cover")
    : { data: [] };

  const covers = new Map<string, string | null>();
  for (const row of coverRows ?? []) {
    covers.set(
      row.project_id,
      assetUrl(
        supabase,
        row.media_assets as unknown as AssetRelation,
      ),
    );
  }

  const storyRow = storyRows?.[0] ?? null;
  const story = storyRow
    ? {
        ...storyRow,
        coverUrl: assetUrl(
          supabase,
          storyRow.cover_asset as unknown as AssetRelation,
        ),
      }
    : null;

  return {
    projects: projectList.map((project) => ({
      ...project,
      coverUrl: covers.get(project.id) ?? null,
    })),
    story,
    news: (newsRows ?? []).map((post) => ({
      ...post,
      coverUrl: assetUrl(
        supabase,
        post.cover_asset as unknown as AssetRelation,
      ),
    })),
    resources: resourceRows ?? [],
    partners: (partnerRows ?? []).map((partner) => ({
      ...partner,
      logoUrl: assetUrl(
        supabase,
        partner.logo_asset as unknown as AssetRelation,
      ),
    })),
  };
}
