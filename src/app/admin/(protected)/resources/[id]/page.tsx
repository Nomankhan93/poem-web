import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { requireAdmin } from "@/lib/admin/auth";

export default async function EditResourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: resource }, { data: projects }] = await Promise.all([
    supabase
      .from("resources")
      .select(
        "id,slug,title,category,year,description,project_id,featured,published,pdf_asset:media_assets!resources_pdf_asset_id_fkey(id,file_name),cover_asset:media_assets!resources_cover_asset_id_fkey(id,file_name)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("projects")
      .select("id,title")
      .neq("status", "archived")
      .order("title"),
  ]);

  if (!resource) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Resources"
        title="Edit resource"
        description={resource.title}
        action={
          resource.published ? (
            <Link
              href={`/resources/${resource.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-poem-900"
            >
              Public page
              <ArrowUpRight size={15} />
            </Link>
          ) : undefined
        }
      />

      {query.saved ? <Notice>Resource saved successfully.</Notice> : null}
      {query.error ? <Notice tone="error">{query.error}</Notice> : null}

      <div className="mt-7">
        <ResourceForm projects={projects ?? []} resource={resource as never} />
      </div>
    </div>
  );
}
