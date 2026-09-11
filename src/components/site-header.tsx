"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Projects", href: "/projects" },
  { label: "Impact", href: "/impact" },
  { label: "Resources", href: "/resources" },
  { label: "News", href: "/news" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-poem-950 text-white">
        <div className="container-poem flex min-h-9 items-center justify-between gap-4 py-2 text-xs font-medium">
          <p className="text-white/70">Participatory Organization for Empowering Marginalized</p>
          <p className="hidden text-poem-lime sm:block">Mirpurkhas, Sindh, Pakistan</p>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="container-poem flex h-[82px] items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-poem-900 text-lg font-black text-white shadow-lg shadow-poem-900/15 transition group-hover:-rotate-3">P</div>
            <div>
              <div className="text-xl font-extrabold tracking-[-0.04em] text-poem-950">POEM</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-poem-muted">Pakistan</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navigation.map((item) => (
              <Link key={item.label} href={item.href} className="text-sm font-semibold text-poem-ink transition hover:text-poem-700">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/contact" className="rounded-full px-4 py-3 text-sm font-bold text-poem-900 transition hover:bg-poem-soft">Contact</Link>
            <Link href="/donate" className="inline-flex items-center gap-2 rounded-full bg-poem-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-poem-900/15 transition hover:-translate-y-0.5 hover:bg-poem-800">
              Donate <ArrowUpRight size={16} />
            </Link>
          </div>

          <button type="button" onClick={() => setOpen(!open)} className="grid size-11 place-items-center rounded-xl border border-black/10 lg:hidden" aria-label="Toggle navigation" aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-black/5 bg-white lg:hidden">
            <nav className="container-poem flex flex-col py-5">
              {navigation.map((item) => (
                <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className="border-b border-black/5 py-4 text-base font-semibold text-poem-ink">
                  {item.label}
                </Link>
              ))}
              <Link href="/partners" onClick={() => setOpen(false)} className="border-b border-black/5 py-4 text-base font-semibold text-poem-ink">Partners</Link>
              <Link href="/about/team" onClick={() => setOpen(false)} className="border-b border-black/5 py-4 text-base font-semibold text-poem-ink">Team</Link>
              <Link href="/careers" onClick={() => setOpen(false)} className="border-b border-black/5 py-4 text-base font-semibold text-poem-ink">Careers</Link>
              <Link href="/tenders" onClick={() => setOpen(false)} className="border-b border-black/5 py-4 text-base font-semibold text-poem-ink">Tenders</Link>
              <Link href="/contact" onClick={() => setOpen(false)} className="border-b border-black/5 py-4 text-base font-semibold text-poem-ink">Contact</Link>
              <Link href="/donate" onClick={() => setOpen(false)} className="mt-5 rounded-xl bg-poem-900 px-5 py-4 text-center font-bold text-white">Donate to POEM</Link>
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
