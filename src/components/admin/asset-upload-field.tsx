"use client";

import { FileUp, ImagePlus, Loader2, X } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFileName } from "@/lib/media";

type ExistingAsset = {
  id: string;
  file_name: string;
} | null;

export function AssetUploadField({
  name,
  bucket,
  label,
  accept,
  prefix,
  existingAsset,
}: {
  name: string;
  bucket: "project-media" | "documents";
  label: string;
  accept: string;
  prefix: string;
  existingAsset?: ExistingAsset;
}) {
  const [assetId, setAssetId] = useState(existingAsset?.id ?? "");
  const [fileName, setFileName] = useState(existingAsset?.file_name ?? "");
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
      const path = `${prefix}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: asset, error: assetError } = await supabase
        .from("media_assets")
        .insert({
          bucket,
          path,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        })
        .select("id,file_name")
        .single();

      if (assetError || !asset) {
        await supabase.storage.from(bucket).remove([path]);
        throw assetError ?? new Error("Could not save media metadata.");
      }

      setAssetId(asset.id);
      setFileName(asset.file_name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={assetId} />

      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-black/15 bg-poem-soft p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-white text-poem-900">
            {bucket === "documents" ? <FileUp size={18} /> : <ImagePlus size={18} />}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-poem-950">{label}</p>
            <p className="truncate text-xs text-poem-muted">
              {fileName || "No file selected"}
            </p>
          </div>

          {assetId ? (
            <button
              type="button"
              onClick={() => {
                setAssetId("");
                setFileName("");
              }}
              className="grid size-9 place-items-center rounded-full bg-white text-poem-muted"
              aria-label={`Remove ${label}`}
            >
              <X size={15} />
            </button>
          ) : null}
        </div>

        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-extrabold text-poem-900 shadow-sm">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <FileUp size={15} />}
          {busy ? "Uploading..." : "Upload file"}
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

        {error ? <p className="text-xs font-bold text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
