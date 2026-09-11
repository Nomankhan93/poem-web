import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Download, FileText } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatBytes } from "@/lib/media";
import { getPublicResources } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Reports, policies, publications, research and accountability resources from POEM Pakistan.",
};

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  "annual-report": "Annual Report",
  "project-report": "Project Report",
  policy: "Policy",
  publication: "Publication",
  research: "Research",
  "case-study": "Case Study",
};

export default async function ResourcesPage() {
  const resources = await getPublicResources();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Resources"
          title="Transparency should be easy to access."
          description="Explore POEM reports, policies, publications, research and case studies."
        />

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading
              eyebrow="Resource library"
              title="Documents that support accountability and learning."
              description="Published documents are managed directly by POEM through the secure administration workspace."
            />

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  className="overflow-hidden rounded-[28px] border border-black/[0.07] bg-white"
                >
                  {resource.coverUrl ? (
                    <div
                      className="aspect-[16/8] bg-poem-soft bg-cover bg-center"
                      style={{ backgroundImage: `url("${resource.coverUrl}")` }}
                      role="img"
                      aria-label={resource.coverAlt || resource.title}
                    />
                  ) : (
                    <div className="grid aspect-[16/8] place-items-center bg-poem-soft text-poem-800">
                      <FileText size={42} />
                    </div>
                  )}

                  <div className="p-7">
                    <div className="flex flex-wrap gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-poem-700">
                      <span>{categoryLabels[resource.category] ?? resource.category}</span>
                      <span>•</span>
                      <span>{resource.year}</span>
                      {resource.featured ? (
                        <>
                          <span>•</span>
                          <span>Featured</span>
                        </>
                      ) : null}
                    </div>

                    <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.035em] text-poem-950">
                      {resource.title}
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-poem-muted">
                      {resource.description}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/resources/${resource.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-extrabold text-poem-800"
                      >
                        View details
                        <ArrowUpRight size={15} />
                      </Link>

                      {resource.downloadUrl ? (
                        <a
                          href={resource.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-poem-soft px-4 py-2 text-xs font-extrabold text-poem-900"
                        >
                          <Download size={14} />
                          PDF
                          {resource.fileSize
                            ? ` · ${formatBytes(resource.fileSize)}`
                            : ""}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {!resources.length ? (
              <div className="mt-12 rounded-[28px] bg-poem-soft p-10 text-center text-poem-muted">
                No published resources are available yet.
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
