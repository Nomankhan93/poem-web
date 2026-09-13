"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { PoemLogo } from "@/components/brand/poem-logo";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/projects", label: "Projects" },
  { href: "/impact", label: "Impact" },
  { href: "/resources", label: "Resources" },
  { href: "/stories", label: "Stories" },
  { href: "/news", label: "News" },
  { href: "/fundraising", label: "Fundraising" },
  { href: "/contact", label: "Contact" },
];

function navLinkClasses(active: boolean) {
  return active
    ? "text-poem-950"
    : "text-poem-muted hover:text-poem-900";
}

export function SiteHeaderClient() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="container-poem flex h-20 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <PoemLogo
            href="/"
            variant="horizontal"
            size="md"
            priority
            imageClassName="max-h-12 w-auto object-contain"
          />
        </div>

        <nav className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-bold transition ${navLinkClasses(active)}`}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/donate"
            className="rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white transition hover:translate-y-[-1px]"
          >
            Donate
          </Link>
        </nav>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-xl border border-black/10 lg:hidden"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Close navigation overlay"
            onClick={() => setOpen(false)}
          />

          <div className="relative ml-auto flex h-full w-[min(88vw,360px)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <PoemLogo
                href="/"
                variant="horizontal"
                size="sm"
                imageClassName="max-h-10 w-auto object-contain"
              />
              <button
                type="button"
                className="grid size-10 place-items-center rounded-xl border border-black/10"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 px-4 py-5">
              {navigation.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                      active
                        ? "bg-poem-soft text-poem-950"
                        : "text-poem-muted hover:bg-poem-soft/60 hover:text-poem-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-black/5 p-4">
              <Link
                href="/donate"
                onClick={() => setOpen(false)}
                className="block rounded-full bg-poem-950 px-5 py-3 text-center text-sm font-extrabold text-white"
              >
                Donate
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
