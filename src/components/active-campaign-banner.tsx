"use client";

import Link from "next/link";
import { ArrowUpRight, Megaphone, X } from "lucide-react";
import { useSyncExternalStore } from "react";

type ActiveCampaignBannerProps = {
  campaignId: string;
  title: string;
  slug: string;
  amountRaisedLabel: string;
  progressPercent: number;
};

const bannerDismissEvent = "poem-campaign-banner-dismissed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(bannerDismissEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(bannerDismissEvent, callback);
  };
}

export function ActiveCampaignBanner({
  campaignId,
  title,
  slug,
  amountRaisedLabel,
  progressPercent,
}: ActiveCampaignBannerProps) {
  const storageKey = `poem-campaign-banner-dismissed:${campaignId}`;

  const dismissed = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return sessionStorage.getItem(storageKey) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );

  function dismiss() {
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // Session storage may be unavailable in restricted browsers.
    }

    window.dispatchEvent(new Event(bannerDismissEvent));
  }

  if (dismissed) {
    return null;
  }

  return (
    <div
      className="border-b border-white/10 bg-poem-950 text-white"
      role="region"
      aria-label="Active fundraising campaign"
    >
      <div className="container-poem flex min-h-11 items-center gap-3 py-2 pr-1 sm:min-h-12">
        <Megaphone
          size={16}
          className="hidden shrink-0 text-poem-lime sm:block"
          aria-hidden="true"
        />

        <span className="hidden shrink-0 rounded-full bg-poem-lime px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-poem-950 lg:inline-flex">
          Active campaign
        </span>

        <Link
          href={`/fundraising/${slug}`}
          className="min-w-0 flex-1 truncate text-xs font-extrabold text-white transition hover:text-poem-lime sm:text-sm"
        >
          {title}
        </Link>

        <div className="hidden items-center gap-3 text-[11px] font-bold text-white/70 md:flex">
          <span>{amountRaisedLabel} raised</span>
          <span aria-hidden="true">•</span>
          <span>{progressPercent}% funded</span>
        </div>

        <Link
          href={`/fundraising/${slug}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-poem-lime px-3 py-1.5 text-[11px] font-black text-poem-950 transition hover:brightness-95 sm:px-4 sm:py-2"
        >
          <span className="hidden sm:inline">Support now</span>
          <span className="sm:hidden">Support</span>
          <ArrowUpRight size={13} aria-hidden="true" />
        </Link>

        <button
          type="button"
          onClick={dismiss}
          className="grid size-8 shrink-0 place-items-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white"
          aria-label={`Dismiss ${title} campaign banner for this session`}
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
