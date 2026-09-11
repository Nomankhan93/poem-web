import Link from "next/link";
import { saveStory } from "@/app/admin/content-actions";
import { AssetUploadField } from "@/components/admin/asset-upload-field";

type StoryRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  person_name: string;
  location: string;
  project_id: string | null;
  featured: boolean;
  published: boolean;
  cover_asset?: { id: string; file_name: string } | null;
};

const input =
  "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-poem-700";
const label = "text-sm font-bold text-poem-900";

export function StoryForm({
  story,
  projects,
}: {
  story?: StoryRecord;
  projects: { id: string; title: string }[];
}) {
  return (
    <form action={saveStory} className="space-y-6">
      {story ? <input type="hidden" name="id" value={story.id} /> : null}

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">Story details</h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className={label}>
            Title *
            <input name="title" required defaultValue={story?.title} className={input} />
          </label>

          <label className={label}>
            Slug *
            <input
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              defaultValue={story?.slug}
              className={input}
            />
          </label>

          <label className={label}>
            Person / community name
            <input name="person_name" defaultValue={story?.person_name} className={input} />
          </label>

          <label className={label}>
            Location
            <input name="location" defaultValue={story?.location} className={input} />
          </label>

          <label className={`${label} md:col-span-2`}>
            Related project
            <select name="project_id" defaultValue={story?.project_id ?? ""} className={input}>
              <option value="">No related project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={`${label} mt-5 block`}>
          Excerpt
          <textarea
            name="excerpt"
            rows={3}
            defaultValue={story?.excerpt}
            className={input}
          />
        </label>

        <label className={`${label} mt-5 block`}>
          Story
          <textarea
            name="body"
            rows={12}
            defaultValue={story?.body}
            className={input}
          />
        </label>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">Cover image</h2>
        <div className="mt-5">
          <AssetUploadField
            name="cover_asset_id"
            bucket="project-media"
            label="Story cover"
            accept="image/jpeg,image/png,image/webp,image/gif"
            prefix="story-covers"
            existingAsset={story?.cover_asset ?? null}
          />
        </div>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={story?.featured}
              className="size-4 accent-poem-900"
            />
            Feature story
          </label>

          <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
            <input
              type="checkbox"
              name="published"
              defaultChecked={story?.published}
              className="size-4 accent-poem-900"
            />
            Publish
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/stories"
          className="rounded-full border border-black/10 px-6 py-3 text-center text-sm font-extrabold text-poem-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-full bg-poem-950 px-7 py-3 text-sm font-extrabold text-white"
        >
          {story ? "Save story" : "Create story"}
        </button>
      </div>
    </form>
  );
}
