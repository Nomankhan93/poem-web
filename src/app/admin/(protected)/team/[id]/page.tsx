import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { TeamForm } from "@/components/admin/organization-forms";
import { requireAdmin } from "@/lib/admin/auth";

export default async function EditTeamPage({
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
    .from("team_members")
    .select("id,name,role_title,member_type,bio,email,linkedin_url,photo_asset_id,display_order,published,photo_asset:media_assets!team_members_photo_asset_id_fkey(id,file_name)")
    .eq("id", id)
    .maybeSingle();

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Team member"
        title="Edit team member"
        description={item.name}
        action={
          item.published ? (
            <Link href={"/about/team"} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-poem-900">
              Public page
              <ArrowUpRight size={15} />
            </Link>
          ) : undefined
        }
      />

      {query.saved ? <Notice>Team member saved successfully.</Notice> : null}
      {query.error ? <Notice tone="error">{query.error}</Notice> : null}

      <div className="mt-7"><TeamForm member={item as never} /></div>
    </div>
  );
}
