import {
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
import {
  inviteAdminUser,
  updateUserRole,
  updateUserStatus,
} from "@/app/admin/user-actions";
import {
  AdminPageHeader,
  Notice,
} from "@/components/admin/admin-ui";
import { requireSuperAdmin } from "@/lib/admin/auth";
import { hasSupabaseAdminSecret } from "@/lib/supabase/admin";

const roles = ["super_admin", "admin", "editor", "viewer"];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    invited?: string;
    updated?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const { supabase, user } = await requireSuperAdmin();

  const [{ data: profiles }, { data: events }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id,email,full_name,role,status,last_seen_at,created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("admin_access_log")
      .select(
        "id,action,details,created_at,target_user_id",
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Security"
        title="Users & access"
        description="Invite POEM staff, assign roles and disable access without using Supabase Studio."
      />

      {params.invited ? (
        <Notice>
          Invitation sent. The new user can set up their account from the
          Supabase invitation email.
        </Notice>
      ) : null}
      {params.updated ? <Notice>User access updated.</Notice> : null}
      {params.error ? (
        <Notice tone="error">{params.error}</Notice>
      ) : null}

      {!hasSupabaseAdminSecret() ? (
        <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-6">
          <p className="font-extrabold text-amber-950">
            Server admin key is not configured.
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-900/70">
            Add <code>SUPABASE_SECRET_KEY</code> to the server environment
            before using invitations. Never prefix this key with
            <code> NEXT_PUBLIC_</code>.
          </p>
        </div>
      ) : null}

      <div className="mt-7 grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
        <section className="rounded-[24px] border border-black/[0.06] bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-poem-soft text-poem-900">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-poem-950">
                Invite staff member
              </h2>
              <p className="text-xs text-poem-muted">
                Super Admin only
              </p>
            </div>
          </div>

          <form action={inviteAdminUser} className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-poem-900">
              Full name
              <input
                name="full_name"
                className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal"
                placeholder="Staff member name"
              />
            </label>

            <label className="block text-sm font-bold text-poem-900">
              Email *
              <input
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal"
                placeholder="staff@thepoempk.com"
              />
            </label>

            <label className="block text-sm font-bold text-poem-900">
              Role
              <select
                name="role"
                defaultValue="editor"
                className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal"
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={!hasSupabaseAdminSecret()}
              className="w-full rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send invitation
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white">
          <div className="flex items-center gap-3 border-b border-black/5 p-6">
            <div className="grid size-11 place-items-center rounded-xl bg-poem-soft text-poem-900">
              <UsersRound size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-poem-950">
                Staff accounts
              </h2>
              <p className="text-xs text-poem-muted">
                {profiles?.length ?? 0} accounts
              </p>
            </div>
          </div>

          <div className="divide-y divide-black/5">
            {(profiles ?? []).map((profile) => (
              <article
                key={profile.id}
                className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-extrabold text-poem-950">
                      {profile.full_name || profile.email || "Unnamed user"}
                    </p>
                    {profile.id === user.id ? (
                      <span className="rounded-full bg-poem-lime px-2.5 py-1 text-[9px] font-extrabold uppercase text-poem-950">
                        You
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-xs text-poem-muted">
                    {profile.email}
                  </p>
                  <p className="mt-2 text-xs text-poem-muted">
                    Last admin activity:{" "}
                    {profile.last_seen_at
                      ? new Date(profile.last_seen_at).toLocaleString()
                      : "Not recorded yet"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <form action={updateUserRole} className="flex gap-2">
                    <input
                      type="hidden"
                      name="user_id"
                      value={profile.id}
                    />
                    <select
                      name="role"
                      defaultValue={profile.role}
                      disabled={profile.id === user.id}
                      className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold disabled:opacity-50"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={profile.id === user.id}
                      className="rounded-full bg-poem-soft px-4 py-2 text-xs font-extrabold text-poem-900 disabled:opacity-40"
                    >
                      Save role
                    </button>
                  </form>

                  {profile.id !== user.id ? (
                    <form action={updateUserStatus}>
                      <input
                        type="hidden"
                        name="user_id"
                        value={profile.id}
                      />
                      <input
                        type="hidden"
                        name="status"
                        value={
                          profile.status === "active"
                            ? "disabled"
                            : "active"
                        }
                      />
                      <button
                        type="submit"
                        className={`rounded-full px-4 py-2 text-xs font-extrabold ${
                          profile.status === "active"
                            ? "bg-red-50 text-red-700"
                            : "bg-green-50 text-green-800"
                        }`}
                      >
                        {profile.status === "active"
                          ? "Disable"
                          : "Enable"}
                      </button>
                    </form>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-[24px] border border-black/[0.06] bg-white p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck size={18} className="text-poem-800" />
          <h2 className="font-extrabold text-poem-950">
            Recent access changes
          </h2>
        </div>

        <div className="mt-5 divide-y divide-black/5">
          {(events ?? []).map((event) => (
            <div
              key={event.id}
              className="flex flex-col justify-between gap-2 py-3 text-sm sm:flex-row"
            >
              <span className="font-bold text-poem-900">
                {event.action.replace("_", " ")}
              </span>
              <span className="text-xs text-poem-muted">
                {new Date(event.created_at).toLocaleString()}
              </span>
            </div>
          ))}

          {!events?.length ? (
            <p className="py-4 text-sm text-poem-muted">
              No access changes recorded yet.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
