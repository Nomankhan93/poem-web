import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-poem-950 text-white">
      <div className="hero-grid absolute inset-0 opacity-60" />
      <div className="absolute -right-28 -top-36 size-[440px] rounded-full border border-white/5" />
      <div className="absolute -right-12 -top-20 size-[300px] rounded-full border border-white/5" />

      <div className="container-poem relative py-20 md:py-28">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-poem-lime">
          {eyebrow}
        </p>

        <h1 className="mt-5 max-w-5xl text-balance text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] md:text-7xl">
          {title}
        </h1>

        <p className="mt-7 max-w-3xl text-lg leading-8 text-white/65">
          {description}
        </p>

        {children ? <div className="mt-9">{children}</div> : null}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance text-4xl font-extrabold leading-[1.02] tracking-tighter text-poem-950 md:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-6 max-w-2xl text-base leading-8 text-poem-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function PageCta({
  title,
  description,
  primaryLabel = "Contact POEM",
  primaryHref = "/contact",
  secondaryLabel = "Explore our work",
  secondaryHref = "/programs",
}: {
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="bg-poem-lime">
      <div className="container-poem flex flex-col justify-between gap-8 py-14 lg:flex-row lg:items-center">
        <div>
          <h2 className="max-w-3xl text-4xl font-extrabold leading-[1.04] tracking-[-0.05em] text-poem-950 md:text-5xl">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-poem-800">
            {description}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-poem-950 px-6 py-3.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5"
          >
            {primaryLabel}
            <ArrowUpRight size={16} />
          </Link>

          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-poem-950/20 px-6 py-3.5 text-sm font-extrabold text-poem-950"
          >
            {secondaryLabel}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
