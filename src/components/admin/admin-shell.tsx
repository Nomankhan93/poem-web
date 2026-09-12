"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpenText,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  FileText,
  FolderKanban,
  Home,
  Images,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  Settings,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/admin/actions";
import { PoemLogo } from "@/components/brand/poem-logo";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  superAdminOnly?: boolean;
  adminOnly?: boolean;
};

const navigation: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: Home },
  { label: "Fundraising", href: "/admin/fundraising", icon: BriefcaseBusiness, adminOnly: true },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Programs", href: "/admin/programs", icon: BriefcaseBusiness },
  { label: "Impact", href: "/admin/impact", icon: BarChart3 },
  { label: "Resources", href: "/admin/resources", icon: FileText },
  { label: "Stories", href: "/admin/stories", icon: BookOpenText },
  { label: "News", href: "/admin/news", icon: Newspaper },
  { label: "Partners", href: "/admin/partners", icon: Building2 },
  { label: "Team", href: "/admin/team", icon: UsersRound },
  { label: "Careers", href: "/admin/careers", icon: BriefcaseBusiness },
  { label: "Tenders", href: "/admin/tenders", icon: ClipboardList },
  { label: "Media", href: "/admin/media", icon: Images },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Audit Log", href: "/admin/audit", icon: Activity, adminOnly: true },
  { label: "Users & Access", href: "/admin/users", icon: ShieldCheck, superAdminOnly: true },
  { label: "Site Settings", href: "/admin/settings", icon: Settings, adminOnly: true },
];

function Sidebar({
  email,
  role,
  close,
}: {
  email: string;
  role: string;
  close?: () => void;
}) {
  const pathname = usePathname();

  const allowedNavigation = navigation.filter((item) => {
    if (item.superAdminOnly) {
      return role === "super_admin";
    }

    if (item.adminOnly) {
      return role === "super_admin" || role === "admin";
    }

    return true;
  });

  return (
    <div className="flex h-full flex-col bg-poem-950 text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/" className="flex items-center gap-3" onClick={close}>
          <PoemLogo
            href=""
            variant="emblem"
            size="md"
            imageClassName="rounded-full bg-white object-contain"
          />
          <div>
            <p className="text-lg font-black tracking-[-0.04em]">POEM</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/55">
              Administration
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {allowedNavigation.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/admin" && pathname.startsWith(`${href}/`));

          return (
            <Link
              key={label}
              href={href}
              onClick={close}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                active
                  ? "bg-poem-lime text-poem-950"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate px-2 text-xs text-white/45">{email}</p>
        <form action={logout}>
          <button
            type="submit"
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-white/65 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({
  email,
  role,
  children,
}: {
  email: string;
  role: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f7f4]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar email={email} role={role} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            className="absolute inset-0 bg-black/45"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-[min(84vw,300px)] shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-5 z-10 grid size-9 place-items-center rounded-full bg-white/10 text-white"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <Sidebar email={email} role={role} close={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-white/90 px-4 backdrop-blur md:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid size-10 place-items-center rounded-xl border border-black/10 lg:hidden"
              aria-label="Open admin navigation"
            >
              <Menu size={18} />
            </button>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-poem-muted">
              POEM Administration
            </p>
          </div>

          <span className="rounded-full bg-poem-soft px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-poem-800">
            {role.replace("_", " ")}
          </span>
        </header>

        <main className="p-4 md:p-7 lg:p-9">{children}</main>
      </div>
    </div>
  );
}
