import { saveProgram } from "@/app/admin/actions";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin/auth";

const inputClass =
  "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-poem-700";

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: programs } = await supabase
    .from("programs")
    .select("*")
    .order("display_order");

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Programs"
        description="Manage POEM's program areas and their public descriptions."
      />

      {params.saved ? <Notice>Program saved.</Notice> : null}
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <section className="mt-7 rounded-[24px] border border-black/[0.06] bg-white p-6">
        <h2 className="text-lg font-extrabold text-poem-950">
          Add a program
        </h2>
        <form action={saveProgram} className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="text-sm font-bold text-poem-900">
            Title
            <input name="title" required className={inputClass} />
          </label>
          <label className="text-sm font-bold text-poem-900">
            Short title
            <input name="short_title" required className={inputClass} />
          </label>
          <label className="text-sm font-bold text-poem-900">
            Slug
            <input
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              className={inputClass}
            />
          </label>
          <label className="text-sm font-bold text-poem-900">
            Display order
            <input
              name="display_order"
              type="number"
              defaultValue="50"
              className={inputClass}
            />
          </label>
          <label className="text-sm font-bold text-poem-900 lg:col-span-2">
            Summary
            <textarea name="summary" rows={3} className={inputClass} />
          </label>
          <label className="text-sm font-bold text-poem-900 lg:col-span-2">
            Description
            <textarea name="description" rows={4} className={inputClass} />
          </label>
          <label className="text-sm font-bold text-poem-900 lg:col-span-2">
            Focus areas — one per line
            <textarea name="focus" rows={4} className={inputClass} />
          </label>
          <div className="flex items-center justify-between gap-4 lg:col-span-2">
            <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
              <input
                type="checkbox"
                name="published"
                className="size-4 accent-poem-900"
              />
              Publish
            </label>
            <button
              type="submit"
              className="rounded-full bg-poem-950 px-6 py-3 text-sm font-extrabold text-white"
            >
              Add program
            </button>
          </div>
        </form>
      </section>

      <div className="mt-6 space-y-4">
        {(programs ?? []).map((program) => (
          <details
            key={program.id}
            className="group rounded-[24px] border border-black/[0.06] bg-white"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6">
              <div>
                <h2 className="font-extrabold text-poem-950">{program.title}</h2>
                <p className="mt-1 text-xs text-poem-muted">/{program.slug}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase ${
                  program.published
                    ? "bg-green-50 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {program.published ? "Published" : "Draft"}
              </span>
            </summary>

            <form
              action={saveProgram}
              className="grid gap-4 border-t border-black/5 p-6 lg:grid-cols-2"
            >
              <input type="hidden" name="id" value={program.id} />
              <label className="text-sm font-bold text-poem-900">
                Title
                <input
                  name="title"
                  required
                  defaultValue={program.title}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold text-poem-900">
                Short title
                <input
                  name="short_title"
                  required
                  defaultValue={program.short_title}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold text-poem-900">
                Slug
                <input
                  name="slug"
                  required
                  defaultValue={program.slug}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold text-poem-900">
                Display order
                <input
                  name="display_order"
                  type="number"
                  defaultValue={program.display_order}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold text-poem-900 lg:col-span-2">
                Summary
                <textarea
                  name="summary"
                  rows={3}
                  defaultValue={program.summary}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold text-poem-900 lg:col-span-2">
                Description
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={program.description}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-bold text-poem-900 lg:col-span-2">
                Focus areas — one per line
                <textarea
                  name="focus"
                  rows={4}
                  defaultValue={(program.focus ?? []).join("\n")}
                  className={inputClass}
                />
              </label>

              <div className="flex items-center justify-between gap-4 lg:col-span-2">
                <label className="flex items-center gap-3 text-sm font-bold text-poem-900">
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={program.published}
                    className="size-4 accent-poem-900"
                  />
                  Publish
                </label>
                <button
                  type="submit"
                  className="rounded-full bg-poem-950 px-6 py-3 text-sm font-extrabold text-white"
                >
                  Save changes
                </button>
              </div>
            </form>
          </details>
        ))}
      </div>
    </div>
  );
}
