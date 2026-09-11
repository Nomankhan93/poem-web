import { Download, FileText, ImageIcon, Trash2 } from "lucide-react";
import {
  deleteMediaAsset,
  updateMediaMetadata,
} from "@/app/admin/media-actions";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { MediaLibraryUploader } from "@/components/admin/media-library-uploader";
import { formatBytes } from "@/lib/media";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: assets } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Media library"
        description="Upload and manage public project images and PDF documents stored in Supabase Storage."
      />

      {params.deleted ? <Notice>Media asset deleted.</Notice> : null}
      {params.saved ? <Notice>Media metadata updated.</Notice> : null}
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <div className="mt-7">
        <MediaLibraryUploader />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(assets ?? []).map((asset) => {
          const url = supabase.storage
            .from(asset.bucket)
            .getPublicUrl(asset.path).data.publicUrl;

          return (
            <article
              key={asset.id}
              className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white"
            >
              {asset.bucket === "project-media" ? (
                <div
                  className="aspect-[16/10] bg-poem-soft bg-cover bg-center"
                  style={{ backgroundImage: `url("${url}")` }}
                  role="img"
                  aria-label={asset.alt_text || asset.file_name}
                />
              ) : (
                <div className="grid aspect-[16/10] place-items-center bg-poem-soft text-poem-800">
                  <FileText size={40} />
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-poem-soft text-poem-900">
                    {asset.bucket === "project-media" ? (
                      <ImageIcon size={16} />
                    ) : (
                      <FileText size={16} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-poem-950">
                      {asset.file_name}
                    </p>
                    <p className="mt-1 text-xs text-poem-muted">
                      {formatBytes(Number(asset.size_bytes))}
                    </p>
                  </div>
                </div>

                <form action={updateMediaMetadata} className="mt-5 space-y-3">
                  <input type="hidden" name="id" value={asset.id} />

                  <label className="block text-xs font-bold text-poem-900">
                    Alt text
                    <input
                      name="alt_text"
                      defaultValue={asset.alt_text}
                      disabled={asset.bucket === "documents"}
                      className="mt-1.5 w-full rounded-lg border border-black/10 px-3 py-2 font-normal disabled:bg-gray-50"
                    />
                  </label>

                  <label className="block text-xs font-bold text-poem-900">
                    Caption
                    <input
                      name="caption"
                      defaultValue={asset.caption}
                      className="mt-1.5 w-full rounded-lg border border-black/10 px-3 py-2 font-normal"
                    />
                  </label>

                  <button
                    type="submit"
                    className="text-xs font-extrabold text-poem-700"
                  >
                    Save metadata
                  </button>
                </form>

                <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-poem-700"
                  >
                    <Download size={14} />
                    Open
                  </a>

                  <form action={deleteMediaAsset}>
                    <input type="hidden" name="id" value={asset.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 text-xs font-extrabold text-red-700"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!assets?.length ? (
        <div className="mt-6 rounded-[24px] border border-dashed border-black/10 bg-white p-10 text-center text-sm text-poem-muted">
          No media uploaded yet.
        </div>
      ) : null}
    </div>
  );
}
