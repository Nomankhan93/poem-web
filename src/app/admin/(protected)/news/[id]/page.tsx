import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { NewsForm } from "@/components/admin/organization-forms";
import { requireAdmin } from "@/lib/admin/auth";

export default async function EditNewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: item } = await supabase
    .from("news_posts")
    .select("id,slug,title,excerpt,body,category,cover_asset_id,featured,published,cover_asset:media_assets!news_posts_cover_asset_id_fkey(id,file_name)")
    .eq("id", id)
    .maybeSingle();

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="News post"
        title="Edit news post"
        description={item.title}
        action={
          item.published ? (
            <Link href={`/news/${item.slug}`} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-poem-900">
              Public page
              <ArrowUpRight size={15} />
            </Link>
          ) : undefined
        }
      />

      {query.saved ? <Notice>News post saved successfully.</Notice> : null}
      {query.error ? <Notice tone="error">{query.error}</Notice> : null}

      <div className="mt-7"><NewsForm post={item as never} /></div>
    </div>
  );
}
