"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFileName } from "@/lib/media";

type StoryMediaItem = {
  id: string;
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

export function StoryMediaManager({
  storyId,
  media,
}: {
  storyId: string;
  media: StoryMediaItem[];
}) {
  const router = useRouter();
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Image must be 10 MB or smaller.");
      }

      const supabase = createClient();
      const safeName = sanitizeFileName(file.name);
      const path = `stories/${storyId}/${crypto.randomUUID()}-${safeName}`;

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

      const { error: linkError } = await supabase.from("story_media").insert({
        story_id: storyId,
        media_asset_id: asset.id,
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
    const { error } = await supabase.from("story_media").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
      <h2 className="text-lg font-extrabold text-poem-950">Story gallery</h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold text-poem-900">
          Alt text
          <input
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal"
            placeholder="Describe the image"
          />
        </label>

        <label className="text-sm font-bold text-poem-900">
          Caption
          <input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal"
            placeholder="Optional caption"
          />
        </label>
      </div>

      <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        {busy ? "Uploading..." : "Add gallery image"}
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
          const supabase = createClient();
          const url = supabase.storage.from(asset.bucket).getPublicUrl(asset.path).data.publicUrl;

          return (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-black/[0.06]">
              <div
                className="aspect-[4/3] bg-poem-soft bg-cover bg-center"
                style={{ backgroundImage: `url("${url}")` }}
                role="img"
                aria-label={asset.alt_text || asset.file_name}
              />
              <div className="p-4">
                <p className="truncate text-sm font-extrabold text-poem-950">{asset.file_name}</p>
                {asset.caption ? (
                  <p className="mt-2 text-xs leading-5 text-poem-muted">{asset.caption}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void unlink(item.id)}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-red-700"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
