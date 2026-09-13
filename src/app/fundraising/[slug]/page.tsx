import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  formatFundraisingMoney,
  getPublicCampaignBySlug,
  getPublicCampaignSupporters,
} from "@/lib/fundraising-campaigns";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getPublicCampaignBySlug(slug);
  if (!campaign) return { title: "Campaign not found" };
  return { title: campaign.title, description: campaign.shortSummary };
}

export default async function CampaignDetailPage({ params }: Props) {
  const { slug } = await params;
  const campaign = await getPublicCampaignBySlug(slug);
  if (!campaign) notFound();
  const supporters = await getPublicCampaignSupporters(campaign.id);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-poem-950 text-white">
          <div className="hero-grid absolute inset-0 opacity-60" />
          <div className="container-poem relative py-16 md:py-24">
            <Link href="/fundraising" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white">
              <ArrowLeft size={16} /> All campaigns
            </Link>
            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-lime">
                  {campaign.category || "Fundraising campaign"}
                </p>
                <h1 className="mt-5 text-balance text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] md:text-7xl">
                  {campaign.title}
                </h1>
                <p className="mt-7 max-w-3xl text-lg leading-8 text-white/65">
                  {campaign.shortSummary}
                </p>
                <div className="mt-8 flex flex-wrap gap-5 text-sm font-bold text-poem-lime">
                  {campaign.location ? <span className="inline-flex items-center gap-2"><MapPin size={16} />{campaign.location}</span> : null}
                  {campaign.endDate ? <span className="inline-flex items-center gap-2"><CalendarDays size={16} />Ends {new Date(`${campaign.endDate}T00:00:00`).toLocaleDateString()}</span> : null}
                  {campaign.beneficiaryTarget !== null ? <span className="inline-flex items-center gap-2"><UsersRound size={16} />{campaign.beneficiaryTarget.toLocaleString()} target beneficiaries</span> : null}
                </div>
              </div>

              {campaign.coverUrl ? (
                <div
                  className="aspect-[4/3] rounded-[30px] bg-white/5 bg-cover bg-center"
                  style={{ backgroundImage: `url("${campaign.coverUrl}")` }}
                  role="img"
                  aria-label={campaign.coverAltText || campaign.title}
                />
              ) : null}
            </div>
          </div>
        </section>

        <section className="section-space bg-white">
          <div className="container-poem grid gap-10 lg:grid-cols-[1fr_.72fr]">
            <article>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">Why this matters</p>
              <div className="mt-5 whitespace-pre-line text-lg leading-9 text-poem-muted">
                {campaign.story || campaign.shortSummary}
              </div>

              {campaign.expectedImpact ? (
                <div className="mt-12 border-t border-black/10 pt-10">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">Expected impact</p>
                  <div className="mt-5 whitespace-pre-line text-lg leading-9 text-poem-muted">{campaign.expectedImpact}</div>
                </div>
              ) : null}

              {campaign.projectSlug && campaign.projectTitle ? (
                <Link
                  href={`/projects/${campaign.projectSlug}`}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800"
                >
                  View related project: {campaign.projectTitle} <ArrowUpRight size={15} />
                </Link>
              ) : null}
            </article>

            <aside className="h-fit rounded-[30px] bg-poem-soft p-7 md:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">Funding progress</p>
              <p className="mt-5 text-4xl font-black tracking-[-0.05em] text-poem-950">
                {formatFundraisingMoney(campaign.amountRaised, campaign.currency)}
              </p>
              <p className="mt-1 text-sm font-bold text-poem-muted">
                raised of {formatFundraisingMoney(campaign.fundingTarget, campaign.currency)} target
              </p>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-black/5">
                <div className="h-full rounded-full bg-poem-700" style={{ width: `${Math.min(campaign.progressPercent, 100)}%` }} />
              </div>
              <div className="mt-3 flex justify-between text-xs font-extrabold text-poem-muted">
                <span>{Math.round(campaign.progressPercent)}% funded</span>
                <span>{formatFundraisingMoney(campaign.fundingGap, campaign.currency)} gap</span>
              </div>

              <div className="mt-8 border-t border-poem-900/10 pt-7">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">How to support</p>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-poem-muted">
                  {campaign.donationInstructions || "Contact POEM for verified donation instructions for this campaign."}
                </p>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white"
                >
                  Donation inquiry <ArrowUpRight size={15} />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {supporters.length ? (
          <section className="section-space bg-poem-cream">
            <div className="container-poem">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">Recent support</p>
              <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-poem-950">Campaign supporters</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {supporters.map((supporter, index) => (
                  <div key={`${supporter.displayName}-${supporter.donationDate}-${index}`} className="rounded-[22px] bg-white p-5">
                    <p className="font-extrabold text-poem-950">{supporter.displayName}</p>
                    <p className="mt-2 text-lg font-black text-poem-900">{formatFundraisingMoney(supporter.amount, supporter.currency)}</p>
                    <p className="mt-1 text-xs text-poem-muted">{new Date(`${supporter.donationDate}T00:00:00`).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
