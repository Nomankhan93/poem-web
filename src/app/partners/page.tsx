import type { Metadata } from "next";
import Image from "next/image";
import { Building2, ExternalLink } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPartners } from "@/lib/organization-content";

export const metadata: Metadata = {
  title: "Partners",
  description: "Partners, donors and institutions working with POEM Pakistan.",
};

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const partners = await getPartners();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Partners"
          title="Progress is built through collaboration."
          description="POEM works with institutions, donors, networks and communities that share a commitment to inclusive and sustainable development."
        />

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading eyebrow="Our partners" title="Organizations working alongside POEM." />

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {partners.map((partner) => (
                <article key={partner.id} className="rounded-[28px] border border-black/[0.07] p-7">
                  <div className="grid h-28 place-items-center rounded-2xl bg-poem-soft p-5">
                    {partner.logoUrl ? (
                      <Image
                        src={partner.logoUrl}
                        alt={`${partner.name} logo`}
                        width={220}
                        height={100}
                        className="max-h-20 w-auto max-w-full object-contain"
                        unoptimized
                      />
                    ) : (
                      <Building2 size={36} className="text-poem-700" />
                    )}
                  </div>

                  <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.16em] text-poem-700">
                    {partner.partnerType}
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-poem-950">{partner.name}</h2>
                  <p className="mt-3 text-sm leading-7 text-poem-muted">{partner.description}</p>

                  {partner.websiteUrl ? (
                    <a href={partner.websiteUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800">
                      Visit website <ExternalLink size={14} />
                    </a>
                  ) : null}
                </article>
              ))}
            </div>

            {!partners.length ? (
              <div className="mt-12 rounded-[28px] bg-poem-soft p-10 text-center text-poem-muted">Partner profiles will appear here once published.</div>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
