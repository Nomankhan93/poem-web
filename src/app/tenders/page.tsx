import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ClipboardList, Clock3 } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getTenders } from "@/lib/organization-content";

export const metadata: Metadata = {
  title: "Tenders",
  description: "Current procurement and tender opportunities from POEM Pakistan.",
};

export const dynamic = "force-dynamic";

export default async function TendersPage() {
  const tenders = await getTenders();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Tenders & procurement" title="Open opportunities. Clear information." description="Current tenders, requests for quotations and procurement notices from POEM." />

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading eyebrow="Procurement" title="Current notices." />

            <div className="mt-12 space-y-4">
              {tenders.map((tender) => (
                <article key={tender.id} className="grid gap-5 rounded-[24px] border border-black/[0.07] p-6 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex flex-wrap gap-3 text-xs font-bold text-poem-muted">
                      {tender.referenceNumber ? <span className="inline-flex items-center gap-1.5"><ClipboardList size={14} />{tender.referenceNumber}</span> : null}
                      {tender.deadline ? <span className="inline-flex items-center gap-1.5"><Clock3 size={14} />Deadline {new Date(tender.deadline).toLocaleDateString()}</span> : null}
                    </div>
                    <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.035em] text-poem-950">{tender.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-poem-muted">{tender.summary}</p>
                  </div>
                  <Link href={`/tenders/${tender.slug}`} className="inline-flex items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white">
                    View tender <ArrowUpRight size={15} />
                  </Link>
                </article>
              ))}
            </div>

            {!tenders.length ? (
              <div className="mt-12 rounded-[28px] bg-poem-soft p-10 text-center text-poem-muted">There are no published tender notices at the moment.</div>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
