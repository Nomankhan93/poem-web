import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { CareerForm } from "@/components/admin/organization-forms";
import { requireAdmin } from "@/lib/admin/auth";

export default async function EditCareerPage({
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
    .from("careers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Vacancy"
        title="Edit vacancy"
        description={item.title}
        action={
          item.published ? (
            <Link href={`/careers/${item.slug}`} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-poem-900">
              Public page
              <ArrowUpRight size={15} />
            </Link>
          ) : undefined
        }
      />

      {query.saved ? <Notice>Vacancy saved successfully.</Notice> : null}
      {query.error ? <Notice tone="error">{query.error}</Notice> : null}

      <div className="mt-7"><CareerForm career={item as never} /></div>
    </div>
  );
}
