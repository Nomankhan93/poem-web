import Link from "next/link";
import { ArrowUpRight, UsersRound } from "lucide-react";
import { unpublishItem } from "@/app/admin/organization-actions";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; updated?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: items } = await supabase
    .from("team_members")
    .select("id,name,role_title,member_type,published,updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Team"
        description="Manage POEM team content from the administration workspace."
        action={
          <Link href="/admin/team/new" className="inline-flex items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white">
            New team member
            <ArrowUpRight size={16} />
          </Link>
        }
      />

      {params.saved ? <Notice>Team member saved.</Notice> : null}
      {params.updated ? <Notice>Team member unpublished.</Notice> : null}
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <div className="mt-7 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white">
        <div className="divide-y divide-black/5">
          {(items ?? []).map((item) => (
            <div key={item.id} className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-poem-soft text-poem-900">
                  <UsersRound size={18} />
                </div>
                <div>
                  <Link href={`/admin/team/${item.id}`} className="font-extrabold text-poem-950 hover:text-poem-700">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-poem-muted">
                    {item.role_title}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase ${item.published ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                  {item.published ? "Published" : "Draft"}
                </span>

                <Link href={`/admin/team/${item.id}`} className="rounded-full border border-black/10 px-4 py-2 text-xs font-extrabold text-poem-900">
                  Edit
                </Link>

                {item.published ? (
                  <form action={unpublishItem}>
                    <input type="hidden" name="table" value="team_members" />
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="return_to" value="/admin/team" />
                    <button type="submit" className="rounded-full border border-black/10 px-4 py-2 text-xs font-extrabold text-red-700">
                      Unpublish
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}

          {!items?.length ? (
            <div className="px-6 py-12 text-center text-sm text-poem-muted">No team yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
