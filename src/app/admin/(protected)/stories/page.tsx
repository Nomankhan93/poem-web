import Link from "next/link";
import { ArrowUpRight, BookOpenText } from "lucide-react";
import { unpublishStory } from "@/app/admin/content-actions";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; updated?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: stories } = await supabase
    .from("stories")
    .select("id,slug,title,person_name,location,featured,published,updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Success stories"
        description="Publish beneficiary and community stories with a clear connection to POEM projects."
        action={
          <Link
            href="/admin/stories/new"
            className="inline-flex items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white"
          >
            New story
            <ArrowUpRight size={16} />
          </Link>
        }
      />

      {params.saved ? <Notice>Story saved.</Notice> : null}
      {params.updated ? <Notice>Story unpublished.</Notice> : null}
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <div className="mt-7 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white">
        <div className="divide-y divide-black/5">
          {(stories ?? []).map((story) => (
            <div
              key={story.id}
              className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-poem-soft text-poem-900">
                  <BookOpenText size={18} />
                </div>
                <div>
                  <Link
                    href={`/admin/stories/${story.id}`}
                    className="font-extrabold text-poem-950 hover:text-poem-700"
                  >
                    {story.title}
                  </Link>
                  <p className="mt-1 text-xs text-poem-muted">
                    {[story.person_name, story.location].filter(Boolean).join(" · ") ||
                      "Community story"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {story.featured ? (
                  <span className="rounded-full bg-poem-lime px-3 py-1.5 text-[9px] font-extrabold uppercase text-poem-950">
                    Featured
                  </span>
                ) : null}

                <span
                  className={`rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase ${
                    story.published
                      ? "bg-green-50 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {story.published ? "Published" : "Draft"}
                </span>

                <Link
                  href={`/admin/stories/${story.id}`}
                  className="rounded-full border border-black/10 px-4 py-2 text-xs font-extrabold text-poem-900"
                >
                  Edit
                </Link>

                {story.published ? (
                  <form action={unpublishStory}>
                    <input type="hidden" name="id" value={story.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-black/10 px-4 py-2 text-xs font-extrabold text-red-700"
                    >
                      Unpublish
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}

          {!stories?.length ? (
            <div className="px-6 py-12 text-center text-sm text-poem-muted">
              No stories yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
