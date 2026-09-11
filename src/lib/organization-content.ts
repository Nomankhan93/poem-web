import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { MediaAsset } from "@/lib/media";

function one<T>(relation: T | T[] | null | undefined): T | null {
  if (!relation) return null;
  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

function publicUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  relation: MediaAsset | MediaAsset[] | null | undefined,
) {
  const asset = one(relation);
  if (!asset) return null;
  return supabase.storage.from(asset.bucket).getPublicUrl(asset.path).data.publicUrl;
}

export async function getPartners() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("partners")
    .select(
      "id,name,slug,partner_type,description,website_url,display_order,featured,logo_asset:media_assets!partners_logo_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)",
    )
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("display_order")
    .order("name");

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    partnerType: row.partner_type,
    description: row.description,
    websiteUrl: row.website_url,
    featured: row.featured,
    logoUrl: publicUrl(
      supabase,
      row.logo_asset as unknown as MediaAsset | MediaAsset[] | null,
    ),
  }));
}

export async function getTeamMembers() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_members")
    .select(
      "id,name,role_title,member_type,bio,email,linkedin_url,display_order,photo_asset:media_assets!team_members_photo_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)",
    )
    .eq("published", true)
    .order("member_type")
    .order("display_order")
    .order("name");

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    roleTitle: row.role_title,
    memberType: row.member_type,
    bio: row.bio,
    email: row.email,
    linkedinUrl: row.linkedin_url,
    photoUrl: publicUrl(
      supabase,
      row.photo_asset as unknown as MediaAsset | MediaAsset[] | null,
    ),
  }));
}

export async function getNewsPosts() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("news_posts")
    .select(
      "id,slug,title,excerpt,category,featured,published_at,cover_asset:media_assets!news_posts_cover_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)",
    )
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    featured: row.featured,
    publishedAt: row.published_at,
    coverUrl: publicUrl(
      supabase,
      row.cover_asset as unknown as MediaAsset | MediaAsset[] | null,
    ),
  }));
}

export async function getNewsPost(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("news_posts")
    .select(
      "id,slug,title,excerpt,body,category,featured,published_at,cover_asset:media_assets!news_posts_cover_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)",
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    body: data.body,
    category: data.category,
    featured: data.featured,
    publishedAt: data.published_at,
    coverUrl: publicUrl(
      supabase,
      data.cover_asset as unknown as MediaAsset | MediaAsset[] | null,
    ),
  };
}

export async function getCareers() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("careers")
    .select(
      "id,slug,title,department,location,employment_type,summary,deadline,status",
    )
    .eq("published", true)
    .eq("status", "open")
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function getCareer(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("careers")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  return error ? null : data;
}

export async function getTenders() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenders")
    .select(
      "id,slug,title,reference_number,summary,issue_date,deadline,status,document_asset:media_assets!tenders_document_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)",
    )
    .eq("published", true)
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    referenceNumber: row.reference_number,
    summary: row.summary,
    issueDate: row.issue_date,
    deadline: row.deadline,
    status: row.status,
    documentUrl: publicUrl(
      supabase,
      row.document_asset as unknown as MediaAsset | MediaAsset[] | null,
    ),
  }));
}

export async function getTender(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenders")
    .select(
      "id,slug,title,reference_number,summary,description,issue_date,deadline,status,document_asset:media_assets!tenders_document_asset_id_fkey(id,bucket,path,file_name,mime_type,size_bytes,alt_text,caption)",
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;

  return {
    ...data,
    documentUrl: publicUrl(
      supabase,
      data.document_asset as unknown as MediaAsset | MediaAsset[] | null,
    ),
  };
}
