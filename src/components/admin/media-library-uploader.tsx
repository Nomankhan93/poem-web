"use client";

import { FileUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFileName } from "@/lib/media";

export function MediaLibraryUploader() {
  const router = useRouter();
  const [bucket, setBucket] = useState<"project-media" | "documents">(
    "project-media",
  );
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");

    try {
      const maxBytes =
        bucket === "documents" ? 25 * 1024 * 1024 : 10 * 1024 * 1024;

      if (file.size > maxBytes) {
        throw new Error(
          bucket === "documents"
            ? "PDF must be 25 MB or smaller."
            : "Image must be 10 MB or smaller.",
        );
      }

      const supabase = createClient();
      const safeName = sanitizeFileName(file.name);
      const path = `library/${new Date().getFullYear()}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { error: metadataError } = await supabase.from("media_assets").insert({
        bucket,
        path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        alt_text: altText,
        caption,
      });

      if (metadataError) {
        await supabase.storage.from(bucket).remove([path]);
        throw metadataError;
      }

      setAltText("");
      setCaption("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  const accept =
    bucket === "documents"
      ? "application/pdf"
      : "image/jpeg,image/png,image/webp,image/gif";

  return (
    <div className="rounded-[24px] border border-black/[0.06] bg-white p-6">
      <h2 className="text-lg font-extrabold text-poem-950">Upload media</h2>
      <p className="mt-2 text-sm leading-6 text-poem-muted">
        Images are limited to 10 MB. PDF documents are limited to 25 MB.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold text-poem-900">
          Media type
          <select
            value={bucket}
            onChange={(event) =>
              setBucket(event.target.value as "project-media" | "documents")
            }
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none"
          >
            <option value="project-media">Image</option>
            <option value="documents">PDF document</option>
          </select>
        </label>

        <label className="text-sm font-bold text-poem-900">
          Alt text
          <input
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            disabled={bucket === "documents"}
            placeholder="Describe the image for accessibility"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-normal outline-none disabled:bg-gray-50"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-bold text-poem-900">
        Caption
        <input
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Optional caption"
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-normal outline-none"
        />
      </label>

      <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
        {busy ? "Uploading..." : "Choose file"}
        <input
          type="file"
          accept={accept}
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
    </div>
  );
}
