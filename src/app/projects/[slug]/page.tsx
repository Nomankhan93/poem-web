import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Download,
  MapPin,
  Quote,
} from "lucide-react";
import { notFound } from "next/navigation";
import { PageCta } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatBytes } from "@/lib/media";
import { getPublicProjectBySlug } from "@/lib/public-content";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

  if (!project) notFound();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-poem-950 text-white">
          <div className="hero-grid absolute inset-0 opacity-60" />

          <div className="container-poem relative py-16 md:py-24">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-bold text-white/60 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              All projects
            </Link>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-poem-lime px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-poem-950">
                    {project.category}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-white/70">
                    {project.status}
                  </span>
                </div>

                <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] md:text-7xl">
                  {project.title}
                </h1>

                <p className="mt-7 max-w-3xl text-lg leading-8 text-white/65">
                  {project.summary}
                </p>

                <div className="mt-9 flex flex-wrap gap-5 text-sm font-bold text-poem-lime">
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={16} />
                    {project.location}
                  </span>

                  {project.donorPartner ? (
                    <span>Partner: {project.donorPartner}</span>
                  ) : null}
                </div>
              </div>

              {project.coverUrl ? (
                <div
                  className="aspect-[4/3] rounded-[30px] bg-white/5 bg-cover bg-center"
                  style={{ backgroundImage: `url("${project.coverUrl}")` }}
                  role="img"
                  aria-label={`${project.title} cover`}
                />
              ) : null}
            </div>
          </div>
        </section>

        <section className="section-space bg-white">
          <div className="container-poem grid gap-12 lg:grid-cols-[1fr_.7fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                The challenge
              </p>
              <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-poem-950">
                Why this work matters.
              </h2>
              <p className="mt-6 text-lg leading-9 text-poem-muted">
                {project.challenge}
              </p>

              <div className="mt-12 border-t border-black/10 pt-10">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                  POEM&apos;s response
                </p>
                <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-poem-950">
                  Designed around participation.
                </h2>
                <p className="mt-6 text-lg leading-9 text-poem-muted">
                  {project.response}
                </p>
              </div>
            </div>

            <aside className="rounded-[30px] bg-poem-soft p-7 md:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                Expected outcomes
              </p>

              <div className="mt-6 space-y-4">
                {project.outcomes.map((outcome: string) => (
                  <div key={outcome} className="flex gap-3">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-poem-lime text-poem-950">
                      <Check size={14} strokeWidth={3} />
                    </span>
                    <p className="text-sm font-bold leading-6 text-poem-900">
                      {outcome}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-poem-900/10 pt-7">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                  SDG alignment
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.sdgs.map((sdg: string) => (
                    <span
                      key={sdg}
                      className="rounded-full bg-white px-3 py-2 text-xs font-extrabold text-poem-900"
                    >
                      {sdg}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {project.gallery.length ? (
          <section className="section-space bg-poem-cream">
            <div className="container-poem">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                Project gallery
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {project.gallery.map((item) =>
                  item.url ? (
                    <figure key={item.id}>
                      <div
                        className="aspect-[4/3] rounded-[26px] bg-white bg-cover bg-center"
                        style={{ backgroundImage: `url("${item.url}")` }}
                        role="img"
                        aria-label={item.altText || project.title}
                      />
                      {item.caption ? (
                        <figcaption className="mt-3 text-sm text-poem-muted">
                          {item.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ) : null,
                )}
              </div>
            </div>
          </section>
        ) : null}

        {project.reports.length || project.featuredStory ? (
          <section className="section-space bg-white">
            <div className="container-poem grid gap-8 lg:grid-cols-2">
              {project.reports.length ? (
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                    Project resources
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-poem-950">
                    Reports & documents
                  </h2>

                  <div className="mt-6 divide-y divide-black/5 rounded-[24px] bg-poem-soft px-5">
                    {project.reports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between gap-4 py-5"
                      >
                        <div>
                          <Link
                            href={`/resources/${report.slug}`}
                            className="font-extrabold text-poem-950"
                          >
                            {report.title}
                          </Link>
                          <p className="mt-1 text-xs text-poem-muted">
                            {report.year}
                            {report.fileSize
                              ? ` · ${formatBytes(report.fileSize)}`
                              : ""}
                          </p>
                        </div>

                        {report.downloadUrl ? (
                          <a
                            href={report.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-poem-900"
                            aria-label={`Download ${report.title}`}
                          >
                            <Download size={16} />
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {project.featuredStory ? (
                <article className="rounded-[28px] bg-poem-950 p-7 text-white md:p-9">
                  <Quote size={28} className="text-poem-lime" />
                  <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-poem-lime">
                    Featured story
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em]">
                    {project.featuredStory.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-white/60">
                    {project.featuredStory.excerpt}
                  </p>
                  <Link
                    href={`/stories/${project.featuredStory.slug}`}
                    className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-poem-lime"
                  >
                    Read story
                    <ArrowUpRight size={15} />
                  </Link>
                </article>
              ) : null}
            </div>
          </section>
        ) : null}

        <PageCta
          title="Interested in supporting or partnering on this work?"
          description="Contact POEM to discuss partnerships, technical collaboration or support."
          primaryLabel="Contact POEM"
          primaryHref="/contact"
          secondaryLabel="View all projects"
          secondaryHref="/projects"
        />
      </main>
      <SiteFooter />
    </>
  );
}
