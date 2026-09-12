import Link from "next/link";

export function GrantTabs({ grantId, active }: { grantId: string; active: "overview" | "finance" | "reporting" | "impact" }) {
  const items = [
    ["overview", "Overview", `/admin/fundraising/grants/${grantId}`],
    ["finance", "Installments & Funds", `/admin/fundraising/grants/${grantId}/finance`],
    ["reporting", "Donor Reporting", `/admin/fundraising/grants/${grantId}/reporting`],
    ["impact", "Impact Integration", `/admin/fundraising/grants/${grantId}/impact`],
  ] as const;

  return (
    <div className="mt-6 flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5">
      {items.map(([key, label, href]) => (
        <Link key={key} href={href} className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${active === key ? "bg-poem-950 text-white" : "text-poem-muted hover:bg-poem-soft hover:text-poem-950"}`}>
          {label}
        </Link>
      ))}
    </div>
  );
}
