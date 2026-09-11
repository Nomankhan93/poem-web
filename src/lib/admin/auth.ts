import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    redirect(
      "/admin/login?error=Supabase%20is%20not%20configured.%20Run%20the%20local%20setup%20first.",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "editor"].includes(profile.role)) {
    await supabase.auth.signOut();
    redirect(
      "/admin/login?error=This%20account%20does%20not%20have%20admin%20access.",
    );
  }

  return { supabase, user, profile };
}
