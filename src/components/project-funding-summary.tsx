import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicProjectFunding } from "@/lib/fundraising-campaigns";
import { formatFundraisingMoney } from "@/lib/fundraising-campaigns";

export function ProjectFundingSummary({ funding }: { funding: PublicProjectFunding }) {
  return (
    <section className="border-b border-black/5 bg-poem-cream">
      <div className="container-poem py-10">
        <div className="grid gap-8 rounded-[28px] bg-white p-7 md:p-9 lg:grid-cols-[1fr_.8fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">Project funding</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-poem-950">
              {formatFundraisingMoney(funding.totalSecured, funding.currency)} secured
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-poem-muted">
              {funding.publicSummary || "POEM is seeking additional support to help this project reach its funding target."}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Target" value={formatFundraisingMoney(funding.fundingTarget, funding.currency)} />
              <Metric label="Actually received" value={formatFundraisingMoney(funding.totalReceived, funding.currency)} />
              <Metric label="Funding gap" value={formatFundraisingMoney(funding.fundingGap, funding.currency)} />
            </div>
          </div>

          <div>
            <div className="h-3 overflow-hidden rounded-full bg-black/5">
              <div className="h-full rounded-full bg-poem-700" style={{ width: `${Math.min(funding.progressPercent, 100)}%` }} />
            </div>
            <div className="mt-3 flex justify-between text-xs font-extrabold text-poem-muted">
              <span>{Math.round(funding.progressPercent)}% funded</span>
              <span className="capitalize">{funding.fundraisingStatus.replaceAll("_", " ")}</span>
            </div>
            {funding.campaignSlug ? (
              <Link
                href={`/fundraising/${funding.campaignSlug}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white"
              >
                Support this project <ArrowUpRight size={15} />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-bold text-poem-muted">{label}</p><p className="mt-1 font-extrabold text-poem-950">{value}</p></div>;
}
