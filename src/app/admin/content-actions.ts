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

export async function saveResource(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = value(formData, "id");

  const payload = {
    slug: value(formData, "slug").toLowerCase(),
    title: value(formData, "title"),
    category: value(formData, "category"),
    year: Number(value(formData, "year")),
    description: value(formData, "description"),
    project_id: nullable(formData, "project_id"),
    pdf_asset_id: nullable(formData, "pdf_asset_id"),
    cover_asset_id: nullable(formData, "cover_asset_id"),
    featured: checked(formData, "featured"),
    published: checked(formData, "published"),
    published_at: checked(formData, "published") ? new Date().toISOString() : null,
  };

  const errorPath = id ? `/admin/resources/${id}` : "/admin/resources/new";

  if (!payload.slug || !payload.title || !payload.category || !payload.year) {
    fail(errorPath, "Title, slug, category and year are required.");
  }

  if (id) {
    const { error } = await supabase.from("resources").update(payload).eq("id", id);
    if (error) fail(errorPath, error.message);
    revalidatePath("/resources");
    revalidatePath(`/resources/${payload.slug}`);
    revalidatePath("/admin/resources");
    redirect(`/admin/resources/${id}?saved=1`);
  }

  const { data, error } = await supabase
    .from("resources")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) fail(errorPath, error?.message ?? "Could not create resource.");

  revalidatePath("/resources");
  revalidatePath(`/resources/${payload.slug}`);
  revalidatePath("/admin/resources");
  redirect(`/admin/resources/${data.id}?saved=1`);
}

export async function saveStory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = value(formData, "id");

  const payload = {
    slug: value(formData, "slug").toLowerCase(),
    title: value(formData, "title"),
    excerpt: value(formData, "excerpt"),
    body: value(formData, "body"),
    person_name: value(formData, "person_name"),
    location: value(formData, "location"),
    project_id: nullable(formData, "project_id"),
    cover_asset_id: nullable(formData, "cover_asset_id"),
    featured: checked(formData, "featured"),
    published: checked(formData, "published"),
    published_at: checked(formData, "published") ? new Date().toISOString() : null,
  };

  const errorPath = id ? `/admin/stories/${id}` : "/admin/stories/new";

  if (!payload.slug || !payload.title) {
    fail(errorPath, "Story title and slug are required.");
  }

  if (id) {
    const { error } = await supabase.from("stories").update(payload).eq("id", id);
    if (error) fail(errorPath, error.message);
    revalidatePath("/stories");
    revalidatePath(`/stories/${payload.slug}`);
    revalidatePath("/admin/stories");
    redirect(`/admin/stories/${id}?saved=1`);
  }

  const { data, error } = await supabase
    .from("stories")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) fail(errorPath, error?.message ?? "Could not create story.");

  revalidatePath("/stories");
  revalidatePath(`/stories/${payload.slug}`);
  revalidatePath("/admin/stories");
  redirect(`/admin/stories/${data.id}?saved=1`);
}

export async function unpublishResource(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = value(formData, "id");

  const { error } = await supabase
    .from("resources")
    .update({ published: false, featured: false })
    .eq("id", id);

  if (error) fail("/admin/resources", error.message);

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  redirect("/admin/resources?updated=1");
}

export async function unpublishStory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = value(formData, "id");

  const { error } = await supabase
    .from("stories")
    .update({ published: false, featured: false })
    .eq("id", id);

  if (error) fail("/admin/stories", error.message);

  revalidatePath("/stories");
  revalidatePath("/admin/stories");
  redirect("/admin/stories?updated=1");
}
