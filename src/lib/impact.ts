import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type ImpactTotals = {
  peopleReached: number;
  womenReached: number;
  menReached: number;
  childrenReached: number;
  youthTrained: number;
  communitiesReached: number;
  trainingsConducted: number;
  livelihoodsSupported: number;
};

export const emptyImpactTotals: ImpactTotals = {
  peopleReached: 0,
  womenReached: 0,
  menReached: 0,
  childrenReached: 0,
  youthTrained: 0,
  communitiesReached: 0,
  trainingsConducted: 0,
  livelihoodsSupported: 0,
};

function add(
  totals: ImpactTotals,
  row: Record<string, unknown>,
): ImpactTotals {
  return {
    peopleReached:
      totals.peopleReached + Number(row.people_reached || 0),
    womenReached:
      totals.womenReached + Number(row.women_reached || 0),
    menReached:
      totals.menReached + Number(row.men_reached || 0),
    childrenReached:
      totals.childrenReached + Number(row.children_reached || 0),
    youthTrained:
      totals.youthTrained + Number(row.youth_trained || 0),
    communitiesReached:
      totals.communitiesReached +
      Number(row.communities_reached || 0),
    trainingsConducted:
      totals.trainingsConducted +
      Number(row.trainings_conducted || 0),
    livelihoodsSupported:
      totals.livelihoodsSupported +
      Number(row.livelihoods_supported || 0),
  };
}

export async function getPublicImpact() {
  if (!isSupabaseConfigured()) {
    return {
      totals: emptyImpactTotals,
      byYear: [],
      byDistrict: [],
      hasPublishedMetrics: false,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_metrics")
    .select(
      "year,district,people_reached,women_reached,men_reached,children_reached,youth_trained,communities_reached,trainings_conducted,livelihoods_supported",
    )
    .eq("published", true)
    .order("year", { ascending: false });

  if (error || !data?.length) {
    return {
      totals: emptyImpactTotals,
      byYear: [],
      byDistrict: [],
      hasPublishedMetrics: false,
    };
  }

  const totals = data.reduce(
    (current, row) => add(current, row),
    emptyImpactTotals,
  );

  const yearMap = new Map<number, ImpactTotals>();
  const districtMap = new Map<string, ImpactTotals>();

  for (const row of data) {
    const year = Number(row.year);
    yearMap.set(
      year,
      add(yearMap.get(year) ?? emptyImpactTotals, row),
    );

    const district = String(row.district || "Not specified");
    districtMap.set(
      district,
      add(
        districtMap.get(district) ?? emptyImpactTotals,
        row,
      ),
    );
  }

  return {
    totals,
    byYear: Array.from(yearMap.entries())
      .map(([year, metrics]) => ({ year, ...metrics }))
      .sort((a, b) => b.year - a.year),
    byDistrict: Array.from(districtMap.entries())
      .map(([district, metrics]) => ({ district, ...metrics }))
      .sort((a, b) => b.peopleReached - a.peopleReached),
    hasPublishedMetrics: true,
  };
}

export function formatImpactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}
