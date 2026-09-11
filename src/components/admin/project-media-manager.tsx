"use client";

import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFileName } from "@/lib/media";

type ProjectMediaItem = {
  id: string;
  role: string;
  display_order: number;
  media_assets: {
    id: string;
    bucket: string;
    path: string;
    file_name: string;
    alt_text: string;
    caption: string;
  } | null;
};

export function ProjectMediaManager({
  projectId,
  media,
}: {
  projectId: string;
  media: ProjectMediaItem[];
}) {
  const router = useRouter();
  const [role, setRole] = useState<"cover" | "gallery">("gallery");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function assetUrl(item: ProjectMediaItem) {
    const asset = item.media_assets;
    if (!asset) return "";
    const supabase = createClient();
    return supabase.storage.from(asset.bucket).getPublicUrl(asset.path).data.publicUrl;
  }

  async function upload(file: File) {
    setBusy(true);
    setError("");

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Image must be 10 MB or smaller.");
      }

      const supabase = createClient();
      const safeName = sanitizeFileName(file.name);
      const path = `projects/${projectId}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(path, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: asset, error: assetError } = await supabase
        .from("media_assets")
        .insert({
          bucket: "project-media",
          path,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          alt_text: altText,
          caption,
        })
        .select("id")
        .single();

      if (assetError || !asset) {
        await supabase.storage.from("project-media").remove([path]);
        throw assetError ?? new Error("Could not save media metadata.");
      }

      if (role === "cover") {
        const { error: coverError } = await supabase
          .from("project_media")
          .delete()
          .eq("project_id", projectId)
          .eq("role", "cover");
        if (coverError) throw coverError;
      }

      const { error: linkError } = await supabase.from("project_media").insert({
        project_id: projectId,
        media_asset_id: asset.id,
        role,
        display_order: media.length,
      });

      if (linkError) throw linkError;

      setAltText("");
      setCaption("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function unlink(id: string) {
    const supabase = createClient();
    const { error: unlinkError } = await supabase
      .from("project_media")
      .delete()
      .eq("id", id);

    if (unlinkError) {
      setError(unlinkError.message);
      return;
    }
    router.refresh();
  }

  return (
    <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
      <h2 className="text-lg font-extrabold text-poem-950">Project media</h2>
      <p className="mt-2 text-sm leading-6 text-poem-muted">
        Upload a cover image or gallery images. Add meaningful alt text for accessibility.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <label className="text-sm font-bold text-poem-900">
          Image role
          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value as "cover" | "gallery")
            }
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3"
          >
            <option value="gallery">Gallery image</option>
            <option value="cover">Cover image</option>
          </select>
        </label>

        <label className="text-sm font-bold text-poem-900">
          Alt text
          <input
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            placeholder="Describe this image"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-normal"
          />
        </label>

        <label className="text-sm font-bold text-poem-900">
          Caption
          <input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Optional caption"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-normal"
          />
        </label>
      </div>

      <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        {busy ? "Uploading..." : "Upload image"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={busy}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.currentTarget.value = "";
          }}
        />
      </label>

      {error ? <p className="mt-4 text-sm font-bold text-red-700">{error}</p> : null}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {media.map((item) => {
          const asset = item.media_assets;
          if (!asset) return null;
          const url = assetUrl(item);

          return (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-black/[0.06]">
              <div
                className="aspect-[4/3] bg-poem-soft bg-cover bg-center"
                style={{ backgroundImage: `url("${url}")` }}
                role="img"
                aria-label={asset.alt_text || asset.file_name}
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-poem-950">
                      {asset.file_name}
                    </p>
                    <p className="mt-1 text-xs text-poem-muted">
                      {item.role === "cover" ? "Cover image" : "Gallery image"}
                    </p>
                  </div>
                  {item.role === "cover" ? <Star size={16} className="shrink-0 text-poem-700" /> : null}
                </div>

                {asset.caption ? (
                  <p className="mt-3 text-xs leading-5 text-poem-muted">{asset.caption}</p>
                ) : null}

                <button
                  type="button"
                  onClick={() => void unlink(item.id)}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-red-700"
                >
                  <Trash2 size={14} />
                  Remove from project
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
