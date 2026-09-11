import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminProfile = {
  id: string;
  email: string | null;
  full_name: string;
  role: "super_admin" | "admin" | "editor" | "viewer";
  status: "active" | "disabled";
  last_seen_at: string | null;
};

async function getAuthenticatedContext() {
  if (!isSupabaseConfigured()) {
    redirect(
      "/admin/login?error=Supabase%20is%20not%20configured.",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,status,last_seen_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    redirect(
      "/admin/login?error=Your%20profile%20could%20not%20be%20loaded.",
    );
  }

  if (profile.status !== "active") {
    await supabase.auth.signOut();
    redirect(
      "/admin/login?error=This%20account%20has%20been%20disabled.",
    );
  }

  await supabase.rpc("touch_last_seen");

  return {
    supabase,
    user,
    profile: profile as AdminProfile,
  };
}

export async function requireAdmin() {
  const context = await getAuthenticatedContext();

  if (
    !["super_admin", "admin", "editor"].includes(context.profile.role)
  ) {
    redirect(
      "/admin/login?error=This%20account%20does%20not%20have%20admin%20access.",
    );
  }

  return context;
}

export async function requireSiteAdmin() {
  const context = await getAuthenticatedContext();

  if (!["super_admin", "admin"].includes(context.profile.role)) {
    redirect(
      "/admin?error=Only%20administrators%20can%20access%20this%20section.",
    );
  }

  return context;
}

export async function requireSuperAdmin() {
  const context = await getAuthenticatedContext();

  if (context.profile.role !== "super_admin") {
    redirect(
      "/admin?error=Only%20the%20Super%20Admin%20can%20manage%20users%20and%20roles.",
    );
  }

  return context;
}
