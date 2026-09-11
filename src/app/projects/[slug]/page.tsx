import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { PageCta } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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

            <div className="mt-10 flex flex-wrap gap-2">
              <span className="rounded-full bg-poem-lime px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-poem-950">
                {project.category}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-white/70">
                {project.status}
              </span>
            </div>

            <h1 className="mt-6 max-w-5xl text-balance text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] md:text-7xl">
              {project.title}
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/65">
              {project.summary}
            </p>

            <div className="mt-9 inline-flex items-center gap-2 text-sm font-bold text-poem-lime">
              <MapPin size={16} />
              {project.location}
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
                  POEM's response
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
                {project.outcomes.map((outcome) => (
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
                  {project.sdgs.map((sdg) => (
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
