"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/admin/auth";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminSecret,
} from "@/lib/supabase/admin";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(message: string): never {
  redirect(`/admin/users?error=${encodeURIComponent(message)}`);
}

const allowedRoles = ["super_admin", "admin", "editor", "viewer"];

export async function inviteAdminUser(formData: FormData) {
  const { supabase, user } = await requireSuperAdmin();

  if (!hasSupabaseAdminSecret()) {
    fail(
      "Server admin key is missing. Configure SUPABASE_SECRET_KEY before inviting users.",
    );
  }

  const email = value(formData, "email").toLowerCase();
  const fullName = value(formData, "full_name");
  const role = value(formData, "role") || "viewer";

  if (!email || !email.includes("@")) {
    fail("Enter a valid email address.");
  }

  if (!allowedRoles.includes(role)) {
    fail("Invalid role.");
  }

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName,
    },
  });

  if (error || !data.user) {
    fail(error?.message ?? "Could not invite user.");
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      role,
      status: "active",
      invited_by: user.id,
    })
    .eq("id", data.user.id);

  if (profileError) {
    fail(profileError.message);
  }

  await supabase.from("admin_access_log").insert({
    actor_id: user.id,
    target_user_id: data.user.id,
    action: "invite",
    details: {
      email,
      role,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?invited=1");
}

export async function updateUserRole(formData: FormData) {
  const { supabase, user } = await requireSuperAdmin();

  const targetUserId = value(formData, "user_id");
  const role = value(formData, "role");

  if (!targetUserId || !allowedRoles.includes(role)) {
    fail("Invalid user or role.");
  }

  if (targetUserId === user.id && role !== "super_admin") {
    fail("You cannot remove your own Super Admin role.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("role,email")
    .eq("id", targetUserId)
    .maybeSingle();

  if (existingError || !existing) {
    fail(existingError?.message ?? "User not found.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", targetUserId);

  if (error) fail(error.message);

  await supabase.from("admin_access_log").insert({
    actor_id: user.id,
    target_user_id: targetUserId,
    action: "role_change",
    details: {
      from: existing.role,
      to: role,
      email: existing.email,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?updated=1");
}

export async function updateUserStatus(formData: FormData) {
  const { supabase, user } = await requireSuperAdmin();

  const targetUserId = value(formData, "user_id");
  const status = value(formData, "status");

  if (!targetUserId || !["active", "disabled"].includes(status)) {
    fail("Invalid user or status.");
  }

  if (targetUserId === user.id && status === "disabled") {
    fail("You cannot disable your own Super Admin account.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("status,email")
    .eq("id", targetUserId)
    .maybeSingle();

  if (existingError || !existing) {
    fail(existingError?.message ?? "User not found.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", targetUserId);

  if (error) fail(error.message);

  await supabase.from("admin_access_log").insert({
    actor_id: user.id,
    target_user_id: targetUserId,
    action: "status_change",
    details: {
      from: existing.status,
      to: status,
      email: existing.email,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?updated=1");
}
