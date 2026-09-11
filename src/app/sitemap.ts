import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const revalidate = 3600;

type SlugRow = {
  slug: string;
  updated_at?: string | null;
  published_at?: string | null;
};

function entry(
  pathname: string,
  options: {
    lastModified?: string | Date | null;
    changeFrequency?:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never";
    priority?: number;
  } = {},
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(pathname),
    lastModified:
      options.lastModified || new Date(),
    changeFrequency:
      options.changeFrequency ?? "weekly",
    priority: options.priority ?? 0.7,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    entry("/", {
      changeFrequency: "daily",
      priority: 1,
    }),
    entry("/about", { priority: 0.8 }),
    entry("/about/team", { priority: 0.7 }),
    entry("/programs", { priority: 0.8 }),
    entry("/projects", {
      changeFrequency: "weekly",
      priority: 0.9,
    }),
    entry("/impact", { priority: 0.8 }),
    entry("/resources", { priority: 0.8 }),
    entry("/stories", { priority: 0.8 }),
    entry("/news", {
      changeFrequency: "daily",
      priority: 0.8,
    }),
    entry("/partners", { priority: 0.7 }),
    entry("/careers", {
      changeFrequency: "daily",
      priority: 0.7,
    }),
    entry("/tenders", {
      changeFrequency: "daily",
      priority: 0.7,
    }),
    entry("/contact", { priority: 0.6 }),
    entry("/donate", { priority: 0.7 }),
  ];

  if (!isSupabaseConfigured()) {
    return staticEntries;
  }

  try {
    const supabase = createPublicClient();

    const [
      projects,
      resources,
      stories,
      news,
      careers,
      tenders,
    ] = await Promise.all([
      supabase
        .from("projects")
        .select("slug,updated_at")
        .eq("published", true),
      supabase
        .from("resources")
        .select("slug,updated_at")
        .eq("published", true),
      supabase
        .from("stories")
        .select("slug,updated_at,published_at")
        .eq("published", true),
      supabase
        .from("news_posts")
        .select("slug,updated_at,published_at")
        .eq("published", true),
      supabase
        .from("careers")
        .select("slug,updated_at")
        .eq("published", true)
        .eq("status", "open"),
      supabase
        .from("tenders")
        .select("slug,updated_at")
        .eq("published", true)
        .in("status", ["open", "closed"]),
    ]);

    const dynamicEntries: MetadataRoute.Sitemap = [];

    const addRows = (
      rows: SlugRow[] | null,
      prefix: string,
      frequency:
        | "daily"
        | "weekly"
        | "monthly",
      priority: number,
    ) => {
      for (const row of rows ?? []) {
        dynamicEntries.push(
          entry(`${prefix}/${row.slug}`, {
            lastModified:
              row.updated_at ||
              row.published_at ||
              new Date(),
            changeFrequency: frequency,
            priority,
          }),
        );
      }
    };

    addRows(
      projects.data as SlugRow[] | null,
      "/projects",
      "monthly",
      0.8,
    );
    addRows(
      resources.data as SlugRow[] | null,
      "/resources",
      "monthly",
      0.7,
    );
    addRows(
      stories.data as SlugRow[] | null,
      "/stories",
      "monthly",
      0.7,
    );
    addRows(
      news.data as SlugRow[] | null,
      "/news",
      "weekly",
      0.7,
    );
    addRows(
      careers.data as SlugRow[] | null,
      "/careers",
      "daily",
      0.6,
    );
    addRows(
      tenders.data as SlugRow[] | null,
      "/tenders",
      "daily",
      0.6,
    );

    return [...staticEntries, ...dynamicEntries];
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    return staticEntries;
  }
}
