import Link from "next/link";
import { saveProject } from "@/app/admin/actions";

type ProgramOption = { id: string; title: string };
type StoryOption = { id: string; title: string };

type ProjectRecord = {
  id: string;
  program_id: string | null;
  featured_story_id: string | null;
  slug: string;
  title: string;
  category: string;
  donor_partner: string;
  summary: string;
  challenge: string;
  response: string;
  outcomes: string[] | null;
  status: string;
  location: string;
  district: string;
  province: string;
  start_date: string | null;
  end_date: string | null;
  featured: boolean;
  published: boolean;
  project_sdgs?: { sdg_code: string }[] | null;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-poem-700";
const labelClass = "text-sm font-bold text-poem-900";

export function ProjectForm({
  programs,
  stories,
  project,
}: {
  programs: ProgramOption[];
  stories: StoryOption[];
  project?: ProjectRecord;
}) {
  return (
    <form action={saveProject} className="space-y-6">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">Project identity</h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Project title *
            <input name="title" required defaultValue={project?.title} className={inputClass} />
          </label>

          <label className={labelClass}>
            Slug *
            <input
              name="slug"
              required
              defaultValue={project?.slug}
              className={inputClass}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            />
          </label>

          <label className={labelClass}>
            Program
            <select
              name="program_id"
              defaultValue={project?.program_id ?? ""}
              className={inputClass}
            >
              <option value="">No program assigned</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Category
            <input name="category" defaultValue={project?.category} className={inputClass} />
          </label>

          <label className={labelClass}>
            Donor / partner
            <input
              name="donor_partner"
              defaultValue={project?.donor_partner}
              className={inputClass}
              placeholder="Partner or donor name"
            />
          </label>

          <label className={labelClass}>
            Featured story
            <select
              name="featured_story_id"
              defaultValue={project?.featured_story_id ?? ""}
              className={inputClass}
            >
              <option value="">No featured story</option>
              {stories.map((story) => (
                <option key={story.id} value={story.id}>
                  {story.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={`${labelClass} mt-5 block`}>
          Summary
          <textarea name="summary" rows={4} defaultValue={project?.summary} className={inputClass} />
        </label>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">Project narrative</h2>

        <label className={`${labelClass} mt-5 block`}>
          Challenge
          <textarea name="challenge" rows={5} defaultValue={project?.challenge} className={inputClass} />
        </label>

        <label className={`${labelClass} mt-5 block`}>
          POEM response
          <textarea name="response" rows={5} defaultValue={project?.response} className={inputClass} />
        </label>

        <label className={`${labelClass} mt-5 block`}>
          Outcomes — one per line
          <textarea
            name="outcomes"
            rows={5}
            defaultValue={project?.outcomes?.join("\n")}
            className={inputClass}
          />
        </label>

        <label className={`${labelClass} mt-5 block`}>
          SDGs — comma separated
          <input
            name="sdgs"
            defaultValue={project?.project_sdgs?.map((item) => item.sdg_code).join(", ")}
            className={inputClass}
          />
        </label>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">Location & timeline</h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Location
            <input name="location" defaultValue={project?.location} className={inputClass} />
          </label>

          <label className={labelClass}>
            District
            <input name="district" defaultValue={project?.district} className={inputClass} />
          </label>

          <label className={labelClass}>
            Province
            <input name="province" defaultValue={project?.province ?? "Sindh"} className={inputClass} />
          </label>

          <label className={labelClass}>
            Status
            <select name="status" defaultValue={project?.status ?? "draft"} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <label className={labelClass}>
            Start date
            <input
              type="date"
              name="start_date"
              defaultValue={project?.start_date ?? ""}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            End date
            <input
              type="date"
              name="end_date"
              defaultValue={project?.end_date ?? ""}
              className={inputClass}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-6">
          <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={project?.featured}
              className="size-4 accent-poem-900"
            />
            Feature this project
          </label>

          <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
            <input
              type="checkbox"
              name="published"
              defaultChecked={project?.published}
              className="size-4 accent-poem-900"
            />
            Publish on public website
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/projects"
          className="rounded-full border border-black/10 px-6 py-3 text-center text-sm font-extrabold text-poem-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-full bg-poem-950 px-7 py-3 text-sm font-extrabold text-white"
        >
          {project ? "Save project" : "Create project"}
        </button>
      </div>
    </form>
  );
}
