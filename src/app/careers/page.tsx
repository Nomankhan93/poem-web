import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Careers",
  description: "Career and employment opportunities at POEM Pakistan.",
};

export default function CareersPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Careers"
          title="Work with purpose."
          description="POEM's careers page is ready for vacancies, consultant opportunities and future recruitment workflows."
        />

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading
              eyebrow="Current opportunities"
              title="Join a team working alongside communities."
              description="No verified vacancies have been added yet. The admin phase will let POEM publish openings with deadlines, locations, requirements and application instructions."
            />

            <div className="mt-12 rounded-[32px] border border-dashed border-poem-900/20 bg-poem-soft p-8 md:p-12">
              <div className="grid size-14 place-items-center rounded-2xl bg-white text-poem-900">
                <BriefcaseBusiness size={24} />
              </div>
              <h2 className="mt-8 text-3xl font-extrabold tracking-[-0.04em] text-poem-950">
                No open vacancies right now.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-poem-muted">
                Future vacancies will appear here automatically once published
                through the POEM admin dashboard.
              </p>

              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800"
              >
                Contact POEM
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
