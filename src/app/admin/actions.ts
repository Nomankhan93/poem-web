"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

function lines(formData: FormData, key: string) {
  return text(formData, key)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function errorRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function signIn(formData: FormData) {
  if (!isSupabaseConfigured()) {
    errorRedirect(
      "/admin/login",
      "Supabase is not configured. Start local Supabase and generate .env.local first.",
    );
  }

  const email = text(formData, "email");
  const password = text(formData, "password");

  if (!email || password.length < 6) {
    errorRedirect("/admin/login", "Enter a valid email and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) errorRedirect("/admin/login", error.message);

  redirect("/admin");
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function saveProgram(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(formData, "id");

  const payload = {
    slug: text(formData, "slug").toLowerCase(),
    title: text(formData, "title"),
    short_title: text(formData, "short_title"),
    summary: text(formData, "summary"),
    description: text(formData, "description"),
    focus: lines(formData, "focus"),
    display_order: Number(text(formData, "display_order") || 0),
    published: checked(formData, "published"),
  };

  if (!payload.slug || !payload.title || !payload.short_title) {
    errorRedirect("/admin/programs", "Slug, title and short title are required.");
  }

  const result = id
    ? await supabase.from("programs").update(payload).eq("id", id)
    : await supabase.from("programs").insert(payload);

  if (result.error) errorRedirect("/admin/programs", result.error.message);

  revalidatePath("/programs");
  revalidatePath("/admin/programs");
  redirect("/admin/programs?saved=1");
}

export async function saveProject(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(formData, "id");

  const payload = {
    program_id: optionalText(formData, "program_id"),
    featured_story_id: optionalText(formData, "featured_story_id"),
    slug: text(formData, "slug").toLowerCase(),
    title: text(formData, "title"),
    category: text(formData, "category"),
    donor_partner: text(formData, "donor_partner"),
    summary: text(formData, "summary"),
    challenge: text(formData, "challenge"),
    response: text(formData, "response"),
    outcomes: lines(formData, "outcomes"),
    status: text(formData, "status") || "draft",
    location: text(formData, "location"),
    district: text(formData, "district"),
    province: text(formData, "province") || "Sindh",
    start_date: optionalText(formData, "start_date"),
    end_date: optionalText(formData, "end_date"),
    featured: checked(formData, "featured"),
    published: checked(formData, "published"),
  };

  if (!payload.slug || !payload.title) {
    errorRedirect(
      id ? `/admin/projects/${id}` : "/admin/projects/new",
      "Slug and title are required.",
    );
  }

  let projectId = id;

  if (id) {
    const { error } = await supabase.from("projects").update(payload).eq("id", id);
    if (error) errorRedirect(`/admin/projects/${id}`, error.message);
  } else {
    const { data, error } = await supabase
      .from("projects")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      errorRedirect("/admin/projects/new", error?.message ?? "Could not create project.");
    }
    projectId = data.id;
  }

  const sdgs = text(formData, "sdgs")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const { error: deleteSdgError } = await supabase
    .from("project_sdgs")
    .delete()
    .eq("project_id", projectId);

  if (deleteSdgError) {
    errorRedirect(`/admin/projects/${projectId}`, deleteSdgError.message);
  }

  if (sdgs.length) {
    const { error: insertSdgError } = await supabase.from("project_sdgs").insert(
      sdgs.map((sdgCode) => ({ project_id: projectId, sdg_code: sdgCode })),
    );
    if (insertSdgError) {
      errorRedirect(`/admin/projects/${projectId}`, insertSdgError.message);
    }
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${payload.slug}`);
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${projectId}?saved=1`);
}

export async function archiveProject(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(formData, "id");

  if (!id) errorRedirect("/admin/projects", "Project ID is missing.");

  const { error } = await supabase
    .from("projects")
    .update({ status: "archived", published: false, featured: false })
    .eq("id", id);

  if (error) errorRedirect("/admin/projects", error.message);

  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  redirect("/admin/projects?archived=1");
}

export async function updateMessageStatus(formData: FormData) {
  const { supabase, profile } = await requireAdmin();

  if (profile.role !== "admin") {
    errorRedirect("/admin/messages", "Only admins can manage contact messages.");
  }

  const id = text(formData, "id");
  const status = text(formData, "status");

  if (!["new", "read", "replied", "archived"].includes(status)) {
    errorRedirect("/admin/messages", "Invalid message status.");
  }

  const { error } = await supabase
    .from("contact_messages")
    .update({ status })
    .eq("id", id);

  if (error) errorRedirect("/admin/messages", error.message);

  revalidatePath("/admin/messages");
  redirect("/admin/messages?updated=1");
}
