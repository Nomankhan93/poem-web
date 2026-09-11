import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { PageCta, PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicPrograms } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore POEM Pakistan's program areas across education, livelihoods, community empowerment and resilience.",
};

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const programs = await getPublicPrograms();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Our programs"
          title="Focused areas. Connected outcomes."
          description="POEM organizes its work around program areas that respond to community priorities while strengthening long-term opportunity, participation and resilience."
        />

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading
              eyebrow="Program portfolio"
              title="Connected pathways to stronger communities."
              description="Each program brings together related projects, results, stories and resources."
            />

            <div className="mt-12 space-y-5">
              {programs.map((program, index) => {
                const Icon = program.icon;

                return (
                  <article
                    id={program.slug}
                    key={program.slug}
                    className="grid overflow-hidden rounded-[32px] border border-black/[0.06] lg:grid-cols-[.42fr_1fr]"
                  >
                    <div className="relative bg-poem-soft p-8 md:p-10">
                      <span className="text-xs font-extrabold text-poem-muted/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="mt-20 grid size-16 place-items-center rounded-2xl bg-poem-900 text-white">
                        <Icon size={27} />
                      </div>
                    </div>

                    <div className="p-8 md:p-10">
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                        {program.shortTitle}
                      </p>
                      <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-poem-950 md:text-4xl">
                        {program.title}
                      </h2>
                      <p className="mt-5 max-w-3xl leading-8 text-poem-muted">
                        {program.description}
                      </p>

                      <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        {program.focus.map((focus) => (
                          <div
                            key={focus}
                            className="flex items-center gap-3 rounded-xl bg-poem-soft px-4 py-3 text-sm font-bold text-poem-900"
                          >
                            <Check size={15} strokeWidth={3} />
                            {focus}
                          </div>
                        ))}
                      </div>

                      <Link
                        href="/projects"
                        className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800"
                      >
                        Explore related projects
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <PageCta
          title="Projects turn program priorities into measurable action."
          description="Explore how these focus areas are translated into community-level projects and outcomes."
          primaryLabel="View projects"
          primaryHref="/projects"
          secondaryLabel="See our impact"
          secondaryHref="/impact"
        />
      </main>
      <SiteFooter />
    </>
  );
}
