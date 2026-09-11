import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getNewsPosts } from "@/lib/organization-content";

export const metadata: Metadata = {
  title: "News & Updates",
  description: "News, events and updates from POEM Pakistan.",
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const posts = await getNewsPosts();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="News & updates"
          title="What is happening across POEM."
          description="Program updates, announcements, events and organizational news."
        />

        <section className="section-space bg-white">
          <div className="container-poem">
            <SectionHeading eyebrow="Latest" title="News from our work." />

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="group overflow-hidden rounded-[28px] border border-black/[0.07]">
                  {post.coverUrl ? (
                    <div className="aspect-[16/10] bg-poem-soft bg-cover bg-center" style={{ backgroundImage: `url("${post.coverUrl}")` }} role="img" aria-label={post.title} />
                  ) : (
                    <div className="grid aspect-[16/10] place-items-center bg-poem-soft text-poem-700">
                      <Newspaper size={42} />
                    </div>
                  )}

                  <div className="p-7">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-poem-700">{post.category}</p>
                    <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-[-0.035em] text-poem-950">{post.title}</h2>
                    <p className="mt-4 text-sm leading-7 text-poem-muted">{post.excerpt}</p>
                    <Link href={`/news/${post.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800">
                      Read update <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {!posts.length ? (
              <div className="mt-12 rounded-[28px] bg-poem-soft p-10 text-center text-poem-muted">No published updates yet.</div>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
