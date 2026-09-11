import type { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-poem-700">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] text-poem-950 md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-poem-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Notice({
  children,
  tone = "success",
}: {
  children: ReactNode;
  tone?: "success" | "error";
}) {
  return (
    <div
      className={`mt-5 rounded-xl border px-4 py-3 text-sm font-bold ${
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-green-200 bg-green-50 text-green-800"
      }`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-black/[0.06] bg-white p-6">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-poem-muted">
        {label}
      </p>
      <p className="mt-5 text-4xl font-black tracking-[-0.05em] text-poem-950">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-poem-muted">{detail}</p>
    </div>
  );
}
