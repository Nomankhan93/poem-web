import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileCheck2 } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Tenders",
  description:
    "Tender, procurement and consulting opportunities from POEM Pakistan.",
};

export default function TendersPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Tenders & opportunities"
          title="Open procurement. Clear information."
          description="This page will publish active tenders, requests for quotations, consultant opportunities and archived procurement notices."
        />

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading
              eyebrow="Procurement"
              title="A transparent home for current opportunities."
              description="When the admin dashboard is connected, expired tenders can automatically move into an archive while current notices remain prominent."
            />

            <div className="mt-12 rounded-[32px] border border-dashed border-poem-900/20 bg-poem-soft p-8 md:p-12">
              <div className="grid size-14 place-items-center rounded-2xl bg-white text-poem-900">
                <FileCheck2 size={24} />
              </div>
              <h2 className="mt-8 text-3xl font-extrabold tracking-[-0.04em] text-poem-950">
                No active tenders have been added.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-poem-muted">
                This section is ready for tender reference numbers, issue
                dates, closing dates, TOR documents and status.
              </p>

              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800"
              >
                Procurement inquiry
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
