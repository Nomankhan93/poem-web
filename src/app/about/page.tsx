import type { Metadata } from "next";
import { Check, Flag, Target } from "lucide-react";
import { PageCta, PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { principles } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about POEM Pakistan, our mission, vision, values and participatory approach to development.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="About POEM"
          title="Development shaped with communities, not for them."
          description="POEM — Participatory Organization for Empowering Marginalized — works alongside underserved communities to strengthen opportunity, inclusion, resilience and local ownership."
        />

        <section className="section-space bg-white">
          <div className="container-poem grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <SectionHeading
              eyebrow="Who we are"
              title="Participation is the starting point."
            />

            <div className="space-y-7 text-lg leading-9 text-poem-muted">
              <p>
                POEM believes sustainable development is stronger when people
                participate in identifying priorities, shaping solutions and
                reviewing progress.
              </p>
              <p>
                Our role is to help create the conditions, partnerships,
                skills and systems that enable marginalized communities to
                participate more fully in decisions that affect their lives.
              </p>

              <div className="grid gap-4 pt-3 sm:grid-cols-2">
                {[
                  "Community-centered",
                  "Inclusive",
                  "Transparent",
                  "Evidence-informed",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl bg-poem-soft p-4 text-sm font-extrabold text-poem-900"
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-poem-lime">
                      <Check size={14} strokeWidth={3} />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-space bg-poem-soft">
          <div className="container-poem grid gap-5 lg:grid-cols-2">
            <article className="rounded-[32px] bg-poem-950 p-8 text-white md:p-10">
              <div className="grid size-13 place-items-center rounded-2xl bg-poem-lime text-poem-950">
                <Target size={22} />
              </div>
              <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.18em] text-poem-lime">
                Our mission
              </p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.04em] md:text-4xl">
                Empower marginalized communities through participation,
                opportunity and sustainable development.
              </h2>
            </article>

            <article className="rounded-[32px] bg-white p-8 md:p-10">
              <div className="grid size-13 place-items-center rounded-2xl bg-poem-soft text-poem-900">
                <Flag size={22} />
              </div>
              <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                Our vision
              </p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-poem-950 md:text-4xl">
                Inclusive and resilient communities able to shape their own
                social and economic future.
              </h2>
            </article>
          </div>
        </section>

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading
              eyebrow="Our values"
              title="How we work matters as much as what we do."
              description="These principles guide how POEM designs programs, builds partnerships and engages communities."
            />

            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {principles.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="min-h-72 rounded-[28px] border border-black/[0.06] p-7"
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-poem-soft text-poem-900">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-9 text-2xl font-extrabold tracking-[-0.035em] text-poem-950">
                    {title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-poem-muted">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <PageCta
          title="Build meaningful change with POEM."
          description="We welcome conversations with communities, development partners, institutions and supporters who share our commitment to inclusive development."
        />
      </main>
      <SiteFooter />
    </>
  );
}
