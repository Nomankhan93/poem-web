import Link from "next/link";
import { saveResource } from "@/app/admin/content-actions";
import { AssetUploadField } from "@/components/admin/asset-upload-field";

type ResourceRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: number;
  description: string;
  project_id: string | null;
  featured: boolean;
  published: boolean;
  pdf_asset?: { id: string; file_name: string } | null;
  cover_asset?: { id: string; file_name: string } | null;
};

const input =
  "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-poem-700";
const label = "text-sm font-bold text-poem-900";

export function ResourceForm({
  resource,
  projects,
  defaultProjectId,
}: {
  resource?: ResourceRecord;
  projects: { id: string; title: string }[];
  defaultProjectId?: string;
}) {
  return (
    <form action={saveResource} className="space-y-6">
      {resource ? <input type="hidden" name="id" value={resource.id} /> : null}

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">Resource details</h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className={label}>
            Title *
            <input name="title" required defaultValue={resource?.title} className={input} />
          </label>

          <label className={label}>
            Slug *
            <input
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              defaultValue={resource?.slug}
              className={input}
            />
          </label>

          <label className={label}>
            Category *
            <select
              name="category"
              required
              defaultValue={resource?.category ?? "publication"}
              className={input}
            >
              <option value="annual-report">Annual Report</option>
              <option value="project-report">Project Report</option>
              <option value="policy">Policy</option>
              <option value="publication">Publication</option>
              <option value="research">Research</option>
              <option value="case-study">Case Study</option>
            </select>
          </label>

          <label className={label}>
            Year *
            <input
              type="number"
              name="year"
              required
              min="2000"
              max="2100"
              defaultValue={resource?.year ?? new Date().getFullYear()}
              className={input}
            />
          </label>

          <label className={`${label} md:col-span-2`}>
            Related project
            <select
              name="project_id"
              defaultValue={resource?.project_id ?? defaultProjectId ?? ""}
              className={input}
            >
              <option value="">Organization-wide resource</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={`${label} mt-5 block`}>
          Description
          <textarea
            name="description"
            rows={5}
            defaultValue={resource?.description}
            className={input}
          />
        </label>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">Files</h2>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <AssetUploadField
            name="pdf_asset_id"
            bucket="documents"
            label="PDF document"
            accept="application/pdf"
            prefix="resources"
            existingAsset={resource?.pdf_asset ?? null}
          />

          <AssetUploadField
            name="cover_asset_id"
            bucket="project-media"
            label="Cover image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            prefix="resource-covers"
            existingAsset={resource?.cover_asset ?? null}
          />
        </div>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={resource?.featured}
              className="size-4 accent-poem-900"
            />
            Feature this resource
          </label>

          <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
            <input
              type="checkbox"
              name="published"
              defaultChecked={resource?.published}
              className="size-4 accent-poem-900"
            />
            Publish
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/resources"
          className="rounded-full border border-black/10 px-6 py-3 text-center text-sm font-extrabold text-poem-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-full bg-poem-950 px-7 py-3 text-sm font-extrabold text-white"
        >
          {resource ? "Save resource" : "Create resource"}
        </button>
      </div>
    </form>
  );
}
