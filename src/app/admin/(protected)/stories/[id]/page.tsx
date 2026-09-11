import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { StoryForm } from "@/components/admin/story-form";
import { StoryMediaManager } from "@/components/admin/story-media-manager";
import { requireAdmin } from "@/lib/admin/auth";

export default async function EditStoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: story }, { data: projects }, { data: media }] =
    await Promise.all([
      supabase
        .from("stories")
        .select(
          "id,slug,title,excerpt,body,person_name,location,project_id,featured,published,cover_asset:media_assets!stories_cover_asset_id_fkey(id,file_name)",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("projects")
        .select("id,title")
        .neq("status", "archived")
        .order("title"),
      supabase
        .from("story_media")
        .select(
          "id,display_order,media_assets(id,bucket,path,file_name,alt_text,caption)",
        )
        .eq("story_id", id)
        .order("display_order"),
    ]);

  if (!story) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Stories"
        title="Edit story"
        description={story.title}
        action={
          story.published ? (
            <Link
              href={`/stories/${story.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-poem-900"
            >
              Public page
              <ArrowUpRight size={15} />
            </Link>
          ) : undefined
        }
      />

      {query.saved ? <Notice>Story saved successfully.</Notice> : null}
      {query.error ? <Notice tone="error">{query.error}</Notice> : null}

      <div className="mt-7 space-y-6">
        <StoryForm projects={projects ?? []} story={story as never} />
        <StoryMediaManager storyId={story.id} media={(media ?? []) as never[]} />
      </div>
    </div>
  );
}
