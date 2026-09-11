import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { PartnerForm } from "@/components/admin/organization-forms";
import { requireAdmin } from "@/lib/admin/auth";

export default async function EditPartnerPage({
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
    .from("partners")
    .select("id,name,slug,partner_type,description,website_url,logo_asset_id,display_order,featured,published,logo_asset:media_assets!partners_logo_asset_id_fkey(id,file_name)")
    .eq("id", id)
    .maybeSingle();

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Partner"
        title="Edit partner"
        description={item.name}
        action={
          item.published ? (
            <Link href={"/partners"} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-poem-900">
              Public page
              <ArrowUpRight size={15} />
            </Link>
          ) : undefined
        }
      />

      {query.saved ? <Notice>Partner saved successfully.</Notice> : null}
      {query.error ? <Notice tone="error">{query.error}</Notice> : null}

      <div className="mt-7"><PartnerForm partner={item as never} /></div>
    </div>
  );
}
