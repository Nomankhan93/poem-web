import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { StoryForm } from "@/components/admin/story-form";
import { requireAdmin } from "@/lib/admin/auth";

export default async function NewStoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: projects } = await supabase
    .from("projects")
    .select("id,title")
    .neq("status", "archived")
    .order("title");

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Stories"
        title="Create success story"
        description="Save the story first; after creation, add an optional image gallery from the edit screen."
      />

      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <div className="mt-7">
        <StoryForm projects={projects ?? []} />
      </div>
    </div>
  );
}
