import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Quote } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicStories } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "Community and success stories from POEM Pakistan projects and programs.",
};

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const stories = await getPublicStories();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Stories of change"
          title="Impact is ultimately about people."
          description="Read community and beneficiary stories that show the human outcomes behind POEM's programs and projects."
        />

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading
              eyebrow="Community voices"
              title="Stories shaped by real experience."
              description="Stories should be published with informed consent, respectful language and verified project context."
            />

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {stories.map((story) => (
                <article
                  key={story.id}
                  className="group overflow-hidden rounded-[28px] border border-black/[0.07] bg-white"
                >
                  {story.coverUrl ? (
                    <div
                      className="aspect-[4/3] bg-poem-soft bg-cover bg-center"
                      style={{ backgroundImage: `url("${story.coverUrl}")` }}
                      role="img"
                      aria-label={story.coverAlt || story.title}
                    />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center bg-poem-soft text-poem-800">
                      <Quote size={42} />
                    </div>
                  )}

                  <div className="p-7">
                    {story.featured ? (
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-poem-700">
                        Featured story
                      </p>
                    ) : null}

                    <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-[-0.035em] text-poem-950">
                      {story.title}
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-poem-muted">
                      {story.excerpt}
                    </p>

                    <div className="mt-5 text-xs font-bold text-poem-muted">
                      {[story.personName, story.location]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>

                    <Link
                      href={`/stories/${story.slug}`}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800"
                    >
                      Read story
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {!stories.length ? (
              <div className="mt-12 rounded-[28px] bg-poem-soft p-10 text-center text-poem-muted">
                No published stories are available yet.
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
