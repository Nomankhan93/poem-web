"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function nullable(formData: FormData, key: string) {
  return value(formData, key) || null;
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function savePartner(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = value(formData, "id");
  const path = id ? `/admin/partners/${id}` : "/admin/partners/new";

  const payload = {
    name: value(formData, "name"),
    slug: value(formData, "slug").toLowerCase(),
    partner_type: value(formData, "partner_type") || "partner",
    description: value(formData, "description"),
    website_url: value(formData, "website_url"),
    logo_asset_id: nullable(formData, "logo_asset_id"),
    display_order: Number(value(formData, "display_order") || 0),
    featured: checked(formData, "featured"),
    published: checked(formData, "published"),
  };

  if (!payload.name || !payload.slug) fail(path, "Name and slug are required.");

  const result = id
    ? await supabase.from("partners").update(payload).eq("id", id)
    : await supabase.from("partners").insert(payload).select("id").single();

  if (result.error) fail(path, result.error.message);
  const itemId = id || ("data" in result ? result.data?.id : null);

  revalidatePath("/partners");
  revalidatePath("/admin/partners");
  redirect(itemId ? `/admin/partners/${itemId}?saved=1` : "/admin/partners?saved=1");
}

export async function saveTeamMember(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = value(formData, "id");
  const path = id ? `/admin/team/${id}` : "/admin/team/new";

  const payload = {
    name: value(formData, "name"),
    role_title: value(formData, "role_title"),
    member_type: value(formData, "member_type") || "team",
    bio: value(formData, "bio"),
    email: value(formData, "email"),
    linkedin_url: value(formData, "linkedin_url"),
    photo_asset_id: nullable(formData, "photo_asset_id"),
    display_order: Number(value(formData, "display_order") || 0),
    published: checked(formData, "published"),
  };

  if (!payload.name || !payload.role_title) fail(path, "Name and role are required.");

  const result = id
    ? await supabase.from("team_members").update(payload).eq("id", id)
    : await supabase.from("team_members").insert(payload).select("id").single();

  if (result.error) fail(path, result.error.message);
  const itemId = id || ("data" in result ? result.data?.id : null);

  revalidatePath("/about/team");
  revalidatePath("/admin/team");
  redirect(itemId ? `/admin/team/${itemId}?saved=1` : "/admin/team?saved=1");
}

export async function saveNews(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = value(formData, "id");
  const path = id ? `/admin/news/${id}` : "/admin/news/new";
  const published = checked(formData, "published");

  const payload = {
    slug: value(formData, "slug").toLowerCase(),
    title: value(formData, "title"),
    excerpt: value(formData, "excerpt"),
    body: value(formData, "body"),
    category: value(formData, "category") || "update",
    cover_asset_id: nullable(formData, "cover_asset_id"),
    featured: checked(formData, "featured"),
    published,
    published_at: published ? new Date().toISOString() : null,
  };

  if (!payload.slug || !payload.title) fail(path, "Title and slug are required.");

  const result = id
    ? await supabase.from("news_posts").update(payload).eq("id", id)
    : await supabase.from("news_posts").insert(payload).select("id").single();

  if (result.error) fail(path, result.error.message);
  const itemId = id || ("data" in result ? result.data?.id : null);

  revalidatePath("/news");
  revalidatePath(`/news/${payload.slug}`);
  revalidatePath("/admin/news");
  redirect(itemId ? `/admin/news/${itemId}?saved=1` : "/admin/news?saved=1");
}

export async function saveCareer(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = value(formData, "id");
  const path = id ? `/admin/careers/${id}` : "/admin/careers/new";

  const payload = {
    slug: value(formData, "slug").toLowerCase(),
    title: value(formData, "title"),
    department: value(formData, "department"),
    location: value(formData, "location"),
    employment_type: value(formData, "employment_type") || "Full-time",
    summary: value(formData, "summary"),
    description: value(formData, "description"),
    requirements: value(formData, "requirements"),
    apply_instructions: value(formData, "apply_instructions"),
    apply_url: value(formData, "apply_url"),
    deadline: nullable(formData, "deadline"),
    status: value(formData, "status") || "draft",
    published: checked(formData, "published"),
  };

  if (!payload.slug || !payload.title) fail(path, "Title and slug are required.");

  const result = id
    ? await supabase.from("careers").update(payload).eq("id", id)
    : await supabase.from("careers").insert(payload).select("id").single();

  if (result.error) fail(path, result.error.message);
  const itemId = id || ("data" in result ? result.data?.id : null);

  revalidatePath("/careers");
  revalidatePath(`/careers/${payload.slug}`);
  revalidatePath("/admin/careers");
  redirect(itemId ? `/admin/careers/${itemId}?saved=1` : "/admin/careers?saved=1");
}

export async function saveTender(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = value(formData, "id");
  const path = id ? `/admin/tenders/${id}` : "/admin/tenders/new";

  const payload = {
    slug: value(formData, "slug").toLowerCase(),
    title: value(formData, "title"),
    reference_number: value(formData, "reference_number"),
    summary: value(formData, "summary"),
    description: value(formData, "description"),
    issue_date: nullable(formData, "issue_date"),
    deadline: nullable(formData, "deadline"),
    document_asset_id: nullable(formData, "document_asset_id"),
    status: value(formData, "status") || "draft",
    published: checked(formData, "published"),
  };

  if (!payload.slug || !payload.title) fail(path, "Title and slug are required.");

  const result = id
    ? await supabase.from("tenders").update(payload).eq("id", id)
    : await supabase.from("tenders").insert(payload).select("id").single();

  if (result.error) fail(path, result.error.message);
  const itemId = id || ("data" in result ? result.data?.id : null);

  revalidatePath("/tenders");
  revalidatePath(`/tenders/${payload.slug}`);
  revalidatePath("/admin/tenders");
  redirect(itemId ? `/admin/tenders/${itemId}?saved=1` : "/admin/tenders?saved=1");
}

export async function unpublishItem(formData: FormData) {
  const { supabase } = await requireAdmin();
  const table = value(formData, "table");
  const id = value(formData, "id");
  const returnTo = value(formData, "return_to") || "/admin";

  const allowed = ["partners", "team_members", "news_posts", "careers", "tenders"];
  if (!allowed.includes(table)) fail(returnTo, "Invalid content type.");

  const { error } = await supabase
    .from(table)
    .update({ published: false })
    .eq("id", id);

  if (error) fail(returnTo, error.message);

  revalidatePath(returnTo);
  redirect(`${returnTo}?updated=1`);
}
