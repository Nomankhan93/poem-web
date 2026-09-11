import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Clock3, MapPin } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCareers } from "@/lib/organization-content";

export const metadata: Metadata = {
  title: "Careers",
  description: "Current career opportunities at POEM Pakistan.",
};

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const careers = await getCareers();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Careers" title="Work with purpose." description="Explore current employment and professional opportunities with POEM." />

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading eyebrow="Open positions" title="Join a team working alongside communities." />

            <div className="mt-12 space-y-4">
              {careers.map((career) => (
                <article key={career.id} className="grid gap-5 rounded-[24px] border border-black/[0.07] p-6 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex flex-wrap gap-3 text-xs font-bold text-poem-muted">
                      <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={14} />{career.department || career.employment_type}</span>
                      {career.location ? <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{career.location}</span> : null}
                      {career.deadline ? <span className="inline-flex items-center gap-1.5"><Clock3 size={14} />Deadline {new Date(career.deadline).toLocaleDateString()}</span> : null}
                    </div>
                    <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.035em] text-poem-950">{career.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-poem-muted">{career.summary}</p>
                  </div>
                  <Link href={`/careers/${career.slug}`} className="inline-flex items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white">
                    View role <ArrowUpRight size={15} />
                  </Link>
                </article>
              ))}
            </div>

            {!careers.length ? (
              <div className="mt-12 rounded-[28px] bg-poem-soft p-10 text-center text-poem-muted">There are no open vacancies at the moment.</div>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
