import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicCampaign } from "@/lib/fundraising-campaigns";
import { formatFundraisingMoney } from "@/lib/fundraising-campaigns";

export function FeaturedFundraisingCampaign({ campaign }: { campaign: PublicCampaign }) {
  return (
    <section className="section-space bg-white">
      <div className="container-poem">
        <div className="grid overflow-hidden rounded-[34px] bg-poem-950 text-white lg:grid-cols-[1fr_.9fr]">
          <div className="p-8 md:p-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-lime">Featured fundraising campaign</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] md:text-5xl">{campaign.title}</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/60">{campaign.shortSummary}</p>

            <div className="mt-8 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-poem-lime" style={{ width: `${Math.min(campaign.progressPercent, 100)}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-3 text-xs font-bold text-white/60">
              <span>{formatFundraisingMoney(campaign.amountRaised, campaign.currency)} raised</span>
              <span>{Math.round(campaign.progressPercent)}% funded</span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/fundraising/${campaign.slug}`} className="inline-flex items-center gap-2 rounded-full bg-poem-lime px-6 py-3.5 text-sm font-extrabold text-poem-950">
                Support this campaign <ArrowUpRight size={16} />
              </Link>
              <Link href="/fundraising" className="rounded-full border border-white/15 px-6 py-3.5 text-sm font-extrabold text-white">
                All campaigns
              </Link>
            </div>
          </div>

          {campaign.coverUrl ? (
            <div
              className="min-h-72 bg-white/5 bg-cover bg-center lg:min-h-full"
              style={{ backgroundImage: `url("${campaign.coverUrl}")` }}
              role="img"
              aria-label={campaign.coverAltText || campaign.title}
            />
          ) : (
            <div className="min-h-72 bg-gradient-to-br from-poem-800 to-poem-600 lg:min-h-full" />
          )}
        </div>
      </div>
    </section>
  );
}
