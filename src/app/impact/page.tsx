import type { Metadata } from "next";
import { BarChart3, MapPinned, TrendingUp, Users } from "lucide-react";
import { PageCta, PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "Explore how POEM Pakistan will present verified reach, results and community impact.",
};

const metrics = [
  { value: "25K+", label: "People reached", icon: Users },
  { value: "40+", label: "Communities", icon: MapPinned },
  { value: "20+", label: "Projects", icon: BarChart3 },
  { value: "15+", label: "Partners", icon: TrendingUp },
];

export default function ImpactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Our impact"
          title="Evidence should make progress visible."
          description="POEM&apos;s new website is being structured to present verified reach, outcomes and learning in a way that is useful to communities, partners and donors."
        />

        <section className="border-b border-black/5 bg-poem-cream">
          <div className="container-poem grid grid-cols-2 lg:grid-cols-4">
            {metrics.map(({ value, label, icon: Icon }, index) => (
              <div
                key={label}
                className={`py-10 ${
                  index !== 0 ? "border-l border-black/10 pl-6 md:pl-10" : ""
                }`}
              >
                <Icon size={20} className="mb-6 text-poem-700" />
                <p className="text-4xl font-black tracking-[-0.05em] text-poem-950 md:text-5xl">
                  {value}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-poem-muted">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading
              eyebrow="Measurement framework"
              title="From activities to outcomes."
              description="The admin/database phase can convert this page into a live impact dashboard with filters by year, district, program and project."
            />

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Reach",
                  text: "Who participated, where, when and through which project.",
                },
                {
                  step: "02",
                  title: "Results",
                  text: "What changed as a direct result of activities and services.",
                },
                {
                  step: "03",
                  title: "Learning",
                  text: "What worked, what did not and how future programs improve.",
                },
              ].map((item) => (
                <article
                  key={item.step}
                  className="rounded-[28px] border border-black/[0.07] p-8"
                >
                  <span className="text-xs font-extrabold text-poem-muted/60">
                    {item.step}
                  </span>
                  <h2 className="mt-20 text-3xl font-extrabold tracking-[-0.04em] text-poem-950">
                    {item.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-poem-muted">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-[32px] bg-poem-soft p-8 md:p-10">
              <p className="text-sm font-extrabold text-poem-900">
                Important
              </p>
              <p className="mt-3 max-w-4xl leading-7 text-poem-muted">
                The figures currently shown are design placeholders from Phase
                1. They must be replaced with POEM&apos;s verified figures before the
                public site is launched. The next data phase should store each
                metric with a reporting period and source.
              </p>
            </div>
          </div>
        </section>

        <PageCta
          title="Good data strengthens accountability."
          description="Explore projects and resources to understand how POEM plans, implements and documents its work."
          primaryLabel="Explore projects"
          primaryHref="/projects"
          secondaryLabel="View resources"
          secondaryHref="/resources"
        />
      </main>
      <SiteFooter />
    </>
  );
}
