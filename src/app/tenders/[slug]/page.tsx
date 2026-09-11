import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getTender } from "@/lib/organization-content";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tender = await getTender(slug);
  return tender ? { title: tender.title, description: tender.summary } : { title: "Tender not found" };
}

export default async function TenderDetailPage({ params }: Props) {
  const { slug } = await params;
  const tender = await getTender(slug);
  if (!tender) notFound();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-poem-950 text-white">
          <div className="container-poem py-16 md:py-24">
            <Link href="/tenders" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white"><ArrowLeft size={16} />All tenders</Link>
            <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.18em] text-poem-lime">{tender.reference_number || "Procurement notice"}</p>
            <h1 className="mt-4 max-w-5xl text-balance text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] md:text-7xl">{tender.title}</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/65">{tender.summary}</p>
          </div>
        </section>

        <section className="section-space bg-white">
          <div className="container-poem grid gap-10 lg:grid-cols-[1fr_.6fr]">
            <article>
              <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-poem-950">Tender details</h2>
              <p className="mt-5 whitespace-pre-wrap text-lg leading-9 text-poem-muted">{tender.description}</p>
            </article>

            <aside className="rounded-[28px] bg-poem-soft p-7">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-poem-700">Procurement information</p>
              {tender.issue_date ? <p className="mt-5 text-sm text-poem-muted">Issued: {new Date(tender.issue_date).toLocaleDateString()}</p> : null}
              {tender.deadline ? <p className="mt-2 text-sm text-poem-muted">Deadline: {new Date(tender.deadline).toLocaleString()}</p> : null}
              {tender.documentUrl ? (
                <a href={tender.documentUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-poem-950 px-6 py-3 text-sm font-extrabold text-white">
                  <Download size={15} /> Open tender PDF
                </a>
              ) : null}
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
