import { updateMessageStatus } from "@/app/admin/actions";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await requireAdmin();

  const { data: messages } =
    profile.role === "admin"
      ? await supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false })
      : { data: [] };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Engagement"
        title="Contact messages"
        description="Inquiries submitted through the public POEM contact form."
      />

      {params.updated ? <Notice>Message status updated.</Notice> : null}
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      {profile.role !== "admin" ? (
        <Notice tone="error">
          Contact messages are restricted to the admin role.
        </Notice>
      ) : null}

      <div className="mt-7 space-y-4">
        {(messages ?? []).map((message) => (
          <article
            key={message.id}
            className="rounded-[24px] border border-black/[0.06] bg-white p-6"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-extrabold text-poem-950">{message.name}</h2>
                  <span className="rounded-full bg-poem-soft px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-poem-700">
                    {message.inquiry_type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-poem-muted">{message.email}</p>
              </div>
              <p className="text-xs text-poem-muted">
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>

            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-poem-muted">
              {message.message}
            </p>

            <form
              action={updateMessageStatus}
              className="mt-5 flex flex-wrap items-center gap-3 border-t border-black/5 pt-5"
            >
              <input type="hidden" name="id" value={message.id} />
              <select
                name="status"
                defaultValue={message.status}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold text-poem-900"
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
              <button
                type="submit"
                className="rounded-full bg-poem-950 px-4 py-2 text-xs font-extrabold text-white"
              >
                Update status
              </button>
            </form>
          </article>
        ))}

        {profile.role === "admin" && !messages?.length ? (
          <div className="rounded-[24px] border border-dashed border-black/10 bg-white p-10 text-center text-sm text-poem-muted">
            No contact messages yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
