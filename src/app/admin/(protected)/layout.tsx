import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdmin();

  return (
    <AdminShell email={user.email ?? "Admin"} role={profile.role}>
      {children}
    </AdminShell>
  );
}
