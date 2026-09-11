import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicProjects } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore POEM Pakistan projects and community development initiatives.",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getPublicProjects();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Projects"
          title="See where strategy becomes action."
          description="Explore POEM projects, community priorities, responses, outcomes and SDG alignment."
        />

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading
              eyebrow="Our work"
              title="Community priorities translated into practical interventions."
              description="Published projects are now managed from POEM's secure administration workspace."
            />

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project.slug}
                  className="group overflow-hidden rounded-[30px] border border-black/[0.07] bg-white transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-poem-950/10"
                >
                  <div className={`h-64 bg-gradient-to-br ${project.accent} p-6`}>
                    <div className="flex items-start justify-between">
                      <span className="rounded-full bg-white/70 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-poem-950 backdrop-blur">
                        {project.category}
                      </span>
                      <span className="rounded-full bg-poem-950 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">
                        {project.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-7">
                    <div className="flex items-center gap-2 text-xs font-bold text-poem-muted">
                      <MapPin size={14} />
                      {project.location}
                    </div>

                    <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-[-0.035em] text-poem-950">
                      {project.title}
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-poem-muted">
                      {project.summary}
                    </p>

                    <Link
                      href={`/projects/${project.slug}`}
                      className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800"
                    >
                      View project
                      <ArrowUpRight
                        size={16}
                        className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
