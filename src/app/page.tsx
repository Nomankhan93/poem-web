import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  FileText,
  MapPin,
  Newspaper,
  Quote,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHomepageContent } from "@/lib/home-content";
import {
  formatImpactNumber,
  getPublicImpact,
} from "@/lib/impact";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, impact, content] = await Promise.all([
    getSiteSettings(),
    getPublicImpact(),
    getHomepageContent(),
  ]);

  const impactCards = [
    ["People reached", impact.totals.peopleReached],
    ["Women reached", impact.totals.womenReached],
    ["Youth trained", impact.totals.youthTrained],
    ["Communities", impact.totals.communitiesReached],
  ] as const;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-poem-950 text-white">
          <div className="hero-grid absolute inset-0 opacity-60" />
          <div className="container-poem relative py-20 md:py-28 lg:py-32">
            <div className="max-w-5xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-poem-lime">
                {settings.homepage_eyebrow}
              </p>
              <h1 className="mt-6 text-balance text-6xl font-extrabold leading-[0.92] tracking-[-0.065em] md:text-8xl">
                {settings.homepage_title}
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/65 md:text-xl">
                {settings.homepage_description}
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href={settings.homepage_primary_href}
                  className="inline-flex items-center gap-2 rounded-full bg-poem-lime px-6 py-3.5 text-sm font-extrabold text-poem-950"
                >
                  {settings.homepage_primary_label}
                  <ArrowUpRight size={16} />
                </Link>
                <Link
                  href={settings.homepage_secondary_href}
                  className="rounded-full border border-white/15 px-6 py-3.5 text-sm font-extrabold text-white"
                >
                  {settings.homepage_secondary_label}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-black/5 bg-white">
          <div className="container-poem py-7">
            {impact.hasPublishedMetrics ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {impactCards.map(([label, value]) => (
                  <div key={label}>
                    <p className="text-3xl font-black tracking-[-0.04em] text-poem-950">
                      {formatImpactNumber(value)}
                    </p>
                    <p className="mt-1 text-xs font-bold text-poem-muted">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-bold text-poem-muted">
                Verified impact metrics will appear here once published.
              </p>
            )}
          </div>
        </section>

        <section className="section-space bg-poem-cream">
          <div className="container-poem">
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                  Our work
                </p>
                <h2 className="mt-4 text-5xl font-extrabold tracking-[-0.055em] text-poem-950">
                  Projects built around participation.
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-poem-muted">
                POEM works with communities to design practical responses
                around education, livelihoods, empowerment and resilience.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {content.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group overflow-hidden rounded-[28px] border border-black/[0.06] bg-white"
                >
                  {project.coverUrl ? (
                    <div
                      className="aspect-[16/10] bg-poem-soft bg-cover bg-center"
                      style={{
                        backgroundImage: `url("${project.coverUrl}")`,
                      }}
                      role="img"
                      aria-label={project.title}
                    />
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-to-br from-[#dce8c6] to-[#afcda9]" />
                  )}

                  <div className="p-7">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-poem-700">
                      {project.category}
                    </p>
                    <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.035em] text-poem-950">
                      {project.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-poem-muted">
                      {project.summary}
                    </p>
                    {project.location ? (
                      <p className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-poem-muted">
                        <MapPin size={14} />
                        {project.location}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>

            <Link
              href="/projects"
              className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800"
            >
              View all projects
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>

        {content.story ? (
          <section className="section-space bg-poem-950 text-white">
            <div className="container-poem grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              {content.story.coverUrl ? (
                <div
                  className="aspect-[4/3] rounded-[30px] bg-white/5 bg-cover bg-center"
                  style={{
                    backgroundImage: `url("${content.story.coverUrl}")`,
                  }}
                  role="img"
                  aria-label={content.story.title}
                />
              ) : (
                <div className="grid aspect-[4/3] place-items-center rounded-[30px] bg-white/5 text-poem-lime">
                  <Quote size={56} />
                </div>
              )}

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-lime">
                  Featured story
                </p>
                <h2 className="mt-4 text-5xl font-extrabold tracking-[-0.055em]">
                  {content.story.title}
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
                  {content.story.excerpt}
                </p>
                <Link
                  href={`/stories/${content.story.slug}`}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-poem-lime"
                >
                  Read the story
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className="section-space bg-white">
          <div className="container-poem grid gap-12 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <Newspaper size={20} className="text-poem-700" />
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                  Latest updates
                </p>
              </div>

              <div className="mt-7 space-y-4">
                {content.news.map((post) => (
                  <Link
                    key={post.id}
                    href={`/news/${post.slug}`}
                    className="block rounded-[22px] border border-black/[0.06] p-5 transition hover:bg-poem-soft"
                  >
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-poem-700">
                      {post.category}
                    </p>
                    <h3 className="mt-2 text-xl font-extrabold text-poem-950">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-poem-muted">
                      {post.excerpt}
                    </p>
                  </Link>
                ))}

                {!content.news.length ? (
                  <p className="rounded-[22px] bg-poem-soft p-6 text-sm text-poem-muted">
                    Published news will appear here.
                  </p>
                ) : null}
              </div>

              <Link
                href="/news"
                className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800"
              >
                All news <ArrowUpRight size={15} />
              </Link>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-poem-700" />
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                  Resources
                </p>
              </div>

              <div className="mt-7 space-y-4">
                {content.resources.map((resource) => (
                  <Link
                    key={resource.id}
                    href={`/resources/${resource.slug}`}
                    className="flex gap-4 rounded-[22px] border border-black/[0.06] p-5 transition hover:bg-poem-soft"
                  >
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-poem-soft text-poem-800">
                      <BookOpenText size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-poem-700">
                        {resource.category} · {resource.year}
                      </p>
                      <h3 className="mt-2 font-extrabold text-poem-950">
                        {resource.title}
                      </h3>
                    </div>
                  </Link>
                ))}

                {!content.resources.length ? (
                  <p className="rounded-[22px] bg-poem-soft p-6 text-sm text-poem-muted">
                    Published reports and resources will appear here.
                  </p>
                ) : null}
              </div>

              <Link
                href="/resources"
                className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800"
              >
                Resource library <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {content.partners.length ? (
          <section className="border-t border-black/5 bg-white">
            <div className="container-poem py-14">
              <p className="text-center text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                Partners & collaborators
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {content.partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="grid min-h-28 place-items-center rounded-2xl bg-poem-soft p-4"
                  >
                    {partner.logoUrl ? (
                      <div
                        className="h-16 w-full bg-contain bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url("${partner.logoUrl}")`,
                        }}
                        role="img"
                        aria-label={`${partner.name} logo`}
                      />
                    ) : (
                      <p className="text-center text-xs font-extrabold text-poem-800">
                        {partner.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
