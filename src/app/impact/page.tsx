import type { Metadata } from "next";
import {
  BarChart3,
  GraduationCap,
  HeartHandshake,
  MapPinned,
  UsersRound,
  Venus,
} from "lucide-react";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  formatImpactNumber,
  getPublicImpact,
} from "@/lib/impact";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "Verified project results and impact metrics published by POEM Pakistan.",
};

export const dynamic = "force-dynamic";

export default async function ImpactPage() {
  const impact = await getPublicImpact();

  const cards = [
    {
      label: "People reached",
      value: impact.totals.peopleReached,
      icon: UsersRound,
    },
    {
      label: "Women reached",
      value: impact.totals.womenReached,
      icon: Venus,
    },
    {
      label: "Youth trained",
      value: impact.totals.youthTrained,
      icon: GraduationCap,
    },
    {
      label: "Communities reached",
      value: impact.totals.communitiesReached,
      icon: MapPinned,
    },
    {
      label: "Trainings conducted",
      value: impact.totals.trainingsConducted,
      icon: BarChart3,
    },
    {
      label: "Livelihoods supported",
      value: impact.totals.livelihoodsSupported,
      icon: HeartHandshake,
    },
  ];

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Impact"
          title="Measure what matters. Publish what is verified."
          description="POEM's public impact metrics are drawn from project-level records that have been reviewed and approved for publication."
        />

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading
              eyebrow="Verified results"
              title="A transparent view of published project outcomes."
              description="Figures only appear here after POEM staff mark the underlying project metrics as verified and published."
            />

            {impact.hasPublishedMetrics ? (
              <>
                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cards.map(({ label, value, icon: Icon }) => (
                    <article
                      key={label}
                      className="rounded-[26px] bg-poem-soft p-7"
                    >
                      <Icon size={22} className="text-poem-700" />
                      <p className="mt-7 text-4xl font-black tracking-[-0.05em] text-poem-950">
                        {formatImpactNumber(value)}
                      </p>
                      <p className="mt-2 text-sm font-bold text-poem-muted">
                        {label}
                      </p>
                    </article>
                  ))}
                </div>

                {impact.byYear.length ? (
                  <div className="mt-16">
                    <SectionHeading
                      eyebrow="By year"
                      title="Published impact over time."
                    />

                    <div className="mt-8 overflow-hidden rounded-[26px] border border-black/[0.07]">
                      {impact.byYear.map((row) => (
                        <div
                          key={row.year}
                          className="grid gap-4 border-b border-black/5 p-6 last:border-b-0 md:grid-cols-[100px_1fr_1fr_1fr]"
                        >
                          <p className="text-2xl font-black text-poem-950">
                            {row.year}
                          </p>
                          <Metric
                            label="People"
                            value={row.peopleReached}
                          />
                          <Metric
                            label="Youth trained"
                            value={row.youthTrained}
                          />
                          <Metric
                            label="Communities"
                            value={row.communitiesReached}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {impact.byDistrict.length ? (
                  <div className="mt-16">
                    <SectionHeading
                      eyebrow="Geographic reach"
                      title="Published results by district."
                    />

                    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {impact.byDistrict.map((row) => (
                        <article
                          key={row.district}
                          className="rounded-[24px] border border-black/[0.07] p-6"
                        >
                          <p className="font-extrabold text-poem-950">
                            {row.district}
                          </p>
                          <p className="mt-5 text-3xl font-black tracking-[-0.04em] text-poem-950">
                            {formatImpactNumber(
                              row.peopleReached,
                            )}
                          </p>
                          <p className="mt-1 text-xs font-bold text-poem-muted">
                            people reached
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-12 rounded-[28px] bg-poem-soft p-10 text-center">
                <p className="font-extrabold text-poem-950">
                  Verified impact metrics are being prepared.
                </p>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-poem-muted">
                  POEM does not publish placeholder impact figures.
                  Verified project results will appear here once they
                  have been reviewed and approved.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <p className="text-xl font-extrabold text-poem-950">
        {formatImpactNumber(value)}
      </p>
      <p className="mt-1 text-xs font-bold text-poem-muted">
        {label}
      </p>
    </div>
  );
}
