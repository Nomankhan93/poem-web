import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Building2, HeartHandshake, ShieldCheck } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support POEM Pakistan and community-centered development initiatives.",
};

export default function DonatePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Support POEM"
          title="Support that strengthens community-led change."
          description="This page is structured for verified donation instructions, project-specific giving and future online payment options."
        />

        <section className="section-space bg-white">
          <div className="container-poem grid gap-10 lg:grid-cols-[1fr_.8fr]">
            <div>
              <SectionHeading
                eyebrow="Why support POEM"
                title="Invest in opportunity, participation and resilience."
                description="Support can help POEM strengthen community programs, expand access to skills and learning, and improve institutional capacity for sustainable local development."
              />

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: HeartHandshake,
                    title: "Community-centered",
                    text: "Support is linked to needs identified with communities.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Accountable",
                    text: "Verified reporting and clear stewardship should accompany every giving channel.",
                  },
                ].map(({ icon: Icon, title, text }) => (
                  <article key={title} className="rounded-2xl bg-poem-soft p-6">
                    <Icon size={22} className="text-poem-800" />
                    <h2 className="mt-6 text-xl font-extrabold text-poem-950">
                      {title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-poem-muted">{text}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-[32px] bg-poem-950 p-7 text-white md:p-9">
              <div className="grid size-13 place-items-center rounded-2xl bg-poem-lime text-poem-950">
                <Building2 size={22} />
              </div>
              <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-poem-lime">
                Bank transfer
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em]">
                Add verified POEM banking details before launch.
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/60">
                We intentionally do not place unverified account information in
                this development build. Add account title, bank, account/IBAN,
                branch and donor receipt instructions once confirmed by POEM.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/fundraising"
                  className="inline-flex items-center gap-2 rounded-full bg-poem-lime px-6 py-3.5 text-sm font-extrabold text-poem-950"
                >
                  Browse fundraising campaigns
                  <ArrowUpRight size={16} />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-extrabold text-white"
              >
                Donation inquiry
                <ArrowUpRight size={16} />
              </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
