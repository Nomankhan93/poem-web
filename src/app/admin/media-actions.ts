"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function deleteMediaAsset(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = value(formData, "id");

  if (!id) redirect("/admin/media?error=Missing%20media%20asset%20ID.");

  const { data: asset, error: findError } = await supabase
    .from("media_assets")
    .select("id,bucket,path")
    .eq("id", id)
    .maybeSingle();

  if (findError || !asset) {
    redirect(
      `/admin/media?error=${encodeURIComponent(
        findError?.message ?? "Media asset was not found.",
      )}`,
    );
  }

  const { error: storageError } = await supabase.storage
    .from(asset.bucket)
    .remove([asset.path]);

  if (storageError) {
    redirect(`/admin/media?error=${encodeURIComponent(storageError.message)}`);
  }

  const { error: dbError } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", id);

  if (dbError) {
    redirect(`/admin/media?error=${encodeURIComponent(dbError.message)}`);
  }

  revalidatePath("/admin/media");
  revalidatePath("/projects");
  revalidatePath("/resources");
  revalidatePath("/stories");
  redirect("/admin/media?deleted=1");
}

export async function updateMediaMetadata(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = value(formData, "id");

  const { error } = await supabase
    .from("media_assets")
    .update({
      alt_text: value(formData, "alt_text"),
      caption: value(formData, "caption"),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/media?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/media");
  revalidatePath("/projects");
  revalidatePath("/stories");
  redirect("/admin/media?saved=1");
}
