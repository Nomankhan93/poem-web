import { ActiveCampaignBanner } from "@/components/active-campaign-banner";
import { SiteHeaderClient } from "@/components/site-header-client";
import {
  formatFundraisingMoney,
  getActiveCampaignForBanner,
} from "@/lib/fundraising-campaigns";

export async function SiteHeader() {
  const campaign = await getActiveCampaignForBanner();

  return (
    <header className="sticky top-0 z-50">
      {campaign ? (
        <ActiveCampaignBanner
          campaignId={campaign.id}
          title={campaign.title}
          slug={campaign.slug}
          amountRaisedLabel={formatFundraisingMoney(
            campaign.amountRaised,
            campaign.currency,
          )}
          progressPercent={Math.max(
            0,
            Math.min(100, Math.round(campaign.progressPercent)),
          )}
        />
      ) : null}

      <SiteHeaderClient />
    </header>
  );
}
