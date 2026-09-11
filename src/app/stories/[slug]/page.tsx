import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin, Quote } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicStoryBySlug } from "@/lib/public-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getPublicStoryBySlug(slug);

  return story
    ? { title: story.title, description: story.excerpt }
    : { title: "Story not found" };
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const story = await getPublicStoryBySlug(slug);

  if (!story) notFound();

  const paragraphs = story.body
    .split(/\n{2,}/)
    .map((paragraph: string) => paragraph.trim())
    .filter(Boolean);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-poem-950 text-white">
          <div className="container-poem py-16 md:py-24">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white"
            >
              <ArrowLeft size={16} />
              All stories
            </Link>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-lime">
                  Community story
                </p>
                <h1 className="mt-4 text-balance text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] md:text-7xl">
                  {story.title}
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                  {story.excerpt}
                </p>

                <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold text-poem-lime">
                  {story.person_name ? <span>{story.person_name}</span> : null}
                  {story.location ? (
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={15} />
                      {story.location}
                    </span>
                  ) : null}
                </div>
              </div>

              {story.coverUrl ? (
                <div
                  className="aspect-[4/3] rounded-[30px] bg-white/5 bg-cover bg-center"
                  style={{ backgroundImage: `url("${story.coverUrl}")` }}
                  role="img"
                  aria-label={story.coverAlt || story.title}
                />
              ) : (
                <div className="grid aspect-[4/3] place-items-center rounded-[30px] bg-white/5 text-poem-lime">
                  <Quote size={56} />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="section-space bg-white">
          <div className="container-poem grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
            <aside>
              <div className="sticky top-28 rounded-[24px] bg-poem-soft p-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-poem-700">
                  Story context
                </p>

                {story.project ? (
                  <div className="mt-5">
                    <p className="text-xs font-bold text-poem-muted">
                      Related project
                    </p>
                    <Link
                      href={`/projects/${story.project.slug}`}
                      className="mt-1 block font-extrabold text-poem-950 hover:text-poem-700"
                    >
                      {story.project.title}
                    </Link>
                  </div>
                ) : null}
              </div>
            </aside>

            <article className="max-w-3xl">
              {paragraphs.map((paragraph: string, index: number) => (
                <p
                  key={`${index}-${paragraph.slice(0, 20)}`}
                  className="mb-6 text-lg leading-9 text-poem-muted"
                >
                  {paragraph}
                </p>
              ))}
            </article>
          </div>

          {story.gallery.length ? (
            <div className="container-poem mt-14">
              <div className="grid gap-5 md:grid-cols-2">
                {story.gallery.map(
                  (
                    item: {
                      id: string;
                      url: string | null;
                      altText: string;
                      caption: string;
                    },
                    index: number,
                  ) =>
                    item.url ? (
                      <figure key={item.id}>
                        <div
                          className="aspect-[4/3] rounded-[24px] bg-poem-soft bg-cover bg-center"
                          style={{ backgroundImage: `url("${item.url}")` }}
                          role="img"
                          aria-label={item.altText || `Story image ${index + 1}`}
                        />
                        {item.caption ? (
                          <figcaption className="mt-3 text-sm text-poem-muted">
                            {item.caption}
                          </figcaption>
                        ) : null}
                      </figure>
                    ) : null,
                )}
              </div>
            </div>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
