import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin, UsersRound } from "lucide-react";
import { PageHero } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  formatFundraisingMoney,
  getPublicCampaigns,
} from "@/lib/fundraising-campaigns";

export const metadata: Metadata = {
  title: "Fundraising",
  description: "Support published POEM fundraising campaigns and community-led projects.",
};

export const dynamic = "force-dynamic";

export default async function FundraisingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const campaigns = await getPublicCampaigns();
  const categories = [...new Set(campaigns.map((item) => item.category).filter(Boolean))].sort();
  const visible = params.category
    ? campaigns.filter((item) => item.category === params.category)
    : campaigns;

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Support POEM"
          title="Fund community-led change."
          description="Explore verified POEM fundraising campaigns, funding targets and progress. Online payment processing is not enabled in this phase; use the verified giving instructions on each campaign."
        />

        <section className="section-space bg-poem-cream">
          <div className="container-poem">
            {categories.length ? (
              <div className="mb-8 flex flex-wrap gap-2">
                <Link
                  href="/fundraising"
                  className={`rounded-full px-4 py-2 text-xs font-extrabold ${!params.category ? "bg-poem-950 text-white" : "bg-white text-poem-900"}`}
                >
                  All
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/fundraising?category=${encodeURIComponent(category)}`}
                    className={`rounded-full px-4 py-2 text-xs font-extrabold ${params.category === category ? "bg-poem-950 text-white" : "bg-white text-poem-900"}`}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {visible.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/fundraising/${campaign.slug}`}
                  className="group overflow-hidden rounded-[28px] border border-black/[0.06] bg-white"
                >
                  {campaign.coverUrl ? (
                    <div
                      className="aspect-[16/10] bg-poem-soft bg-cover bg-center"
                      style={{ backgroundImage: `url("${campaign.coverUrl}")` }}
                      role="img"
                      aria-label={campaign.coverAltText || campaign.title}
                    />
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-to-br from-[#dce8c6] to-[#afcda9]" />
                  )}

                  <div className="p-7">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-poem-700">
                        {campaign.category || "Fundraising"}
                      </p>
                      <span className="rounded-full bg-poem-soft px-3 py-1 text-[10px] font-extrabold uppercase text-poem-800">
                        {campaign.status}
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.035em] text-poem-950">
                      {campaign.title}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-poem-muted">
                      {campaign.shortSummary}
                    </p>

                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-black/5">
                      <div
                        className="h-full rounded-full bg-poem-700"
                        style={{ width: `${Math.min(campaign.progressPercent, 100)}%` }}
                      />
                    </div>
                    <div className="mt-3 flex justify-between gap-4 text-xs font-bold text-poem-muted">
                      <span>{formatFundraisingMoney(campaign.amountRaised, campaign.currency)} raised</span>
                      <span>{Math.round(campaign.progressPercent)}%</span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-poem-muted">
                      {campaign.location ? (
                        <span className="inline-flex items-center gap-2"><MapPin size={14} />{campaign.location}</span>
                      ) : null}
                      {campaign.beneficiaryTarget !== null ? (
                        <span className="inline-flex items-center gap-2"><UsersRound size={14} />{campaign.beneficiaryTarget.toLocaleString()} target beneficiaries</span>
                      ) : null}
                    </div>

                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800">
                      View campaign <ArrowUpRight size={15} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {!visible.length ? (
              <div className="rounded-[28px] bg-white p-10 text-center text-sm text-poem-muted">
                No published fundraising campaigns are available in this category yet.
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
