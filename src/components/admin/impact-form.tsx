import Link from "next/link";
import { saveImpactMetric } from "@/app/admin/impact-actions";

type ProjectOption = {
  id: string;
  title: string;
  district?: string | null;
};

type Metric = {
  id: string;
  project_id: string;
  year: number;
  district: string;
  people_reached: number;
  women_reached: number;
  men_reached: number;
  children_reached: number;
  youth_trained: number;
  communities_reached: number;
  trainings_conducted: number;
  livelihoods_supported: number;
  published: boolean;
};

const input =
  "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-poem-700";
const label = "text-sm font-bold text-poem-900";

export function ImpactForm({
  projects,
  metric,
}: {
  projects: ProjectOption[];
  metric?: Metric;
}) {
  const fields = [
    ["people_reached", "People reached"],
    ["women_reached", "Women reached"],
    ["men_reached", "Men reached"],
    ["children_reached", "Children reached"],
    ["youth_trained", "Youth trained"],
    ["communities_reached", "Communities reached"],
    ["trainings_conducted", "Trainings conducted"],
    ["livelihoods_supported", "Livelihoods supported"],
  ] as const;

  return (
    <form action={saveImpactMetric} className="space-y-6">
      {metric ? (
        <input type="hidden" name="id" value={metric.id} />
      ) : null}

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">
          Metric context
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <label className={`${label} md:col-span-2`}>
            Project *
            <select
              name="project_id"
              required
              defaultValue={metric?.project_id ?? ""}
              className={input}
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>

          <label className={label}>
            Year *
            <input
              name="year"
              type="number"
              min="2000"
              max="2100"
              required
              defaultValue={
                metric?.year ?? new Date().getFullYear()
              }
              className={input}
            />
          </label>

          <label className={`${label} md:col-span-3`}>
            District
            <input
              name="district"
              defaultValue={metric?.district ?? ""}
              className={input}
              placeholder="Mirpurkhas"
            />
          </label>
        </div>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6 md:p-7">
        <h2 className="text-lg font-extrabold text-poem-950">
          Verified results
        </h2>
        <p className="mt-2 text-sm leading-6 text-poem-muted">
          Enter only verified values. Published metrics appear on the
          public Impact page and homepage.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {fields.map(([name, fieldLabel]) => (
            <label key={name} className={label}>
              {fieldLabel}
              <input
                name={name}
                type="number"
                min="0"
                defaultValue={metric?.[name] ?? 0}
                className={input}
              />
            </label>
          ))}
        </div>

        <label className="mt-6 flex items-center gap-3 text-sm font-bold text-poem-900">
          <input
            type="checkbox"
            name="published"
            defaultChecked={metric?.published}
            className="size-4 accent-poem-900"
          />
          Publish verified metrics
        </label>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/impact"
          className="rounded-full border border-black/10 px-6 py-3 text-center text-sm font-extrabold text-poem-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-full bg-poem-950 px-7 py-3 text-sm font-extrabold text-white"
        >
          {metric ? "Save metrics" : "Add metrics"}
        </button>
      </div>
    </form>
  );
}
