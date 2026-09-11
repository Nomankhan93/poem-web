import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { resources } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Reports, policies, publications and accountability resources from POEM Pakistan.",
};

export default function ResourcesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Resources"
          title="Transparency should be easy to access."
          description="This resource library is designed for annual reports, project reports, policies, publications, research and institutional documents."
        />

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading
              eyebrow="Resource library"
              title="Documents that support accountability and learning."
              description="These entries are placeholders. In the database phase, staff will upload PDFs and assign categories, years, cover images and descriptions."
            />

            <div className="mt-12 grid gap-4">
              {resources.map((resource) => (
                <article
                  key={resource.title}
                  className="group grid gap-5 rounded-[24px] border border-black/[0.07] p-6 transition hover:bg-poem-soft md:grid-cols-[auto_1fr_auto] md:items-center"
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-poem-soft text-poem-900 group-hover:bg-white">
                    <FileText size={21} />
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-poem-700">
                      <span>{resource.type}</span>
                      <span>•</span>
                      <span>{resource.year}</span>
                    </div>
                    <h2 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-poem-950">
                      {resource.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-poem-muted">
                      {resource.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-xs font-extrabold text-white opacity-60"
                    title="PDF will be connected in the admin/database phase"
                  >
                    <Download size={15} />
                    Coming soon
                  </button>
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
