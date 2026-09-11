import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getNewsPost } from "@/lib/organization-content";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPost(slug);
  return post ? { title: post.title, description: post.excerpt } : { title: "News not found" };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getNewsPost(slug);
  if (!post) notFound();

  const paragraphs = post.body.split(/\n{2,}/).map((p: string) => p.trim()).filter(Boolean);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-poem-950 text-white">
          <div className="container-poem py-16 md:py-24">
            <Link href="/news" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white">
              <ArrowLeft size={16} /> All news
            </Link>
            <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.18em] text-poem-lime">{post.category}</p>
            <h1 className="mt-4 max-w-5xl text-balance text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] md:text-7xl">{post.title}</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/65">{post.excerpt}</p>
          </div>
        </section>

        <section className="section-space bg-white">
          <div className="container-poem">
            {post.coverUrl ? (
              <div className="mb-12 aspect-[16/8] rounded-[30px] bg-poem-soft bg-cover bg-center" style={{ backgroundImage: `url("${post.coverUrl}")` }} role="img" aria-label={post.title} />
            ) : (
              <div className="mb-12 grid aspect-[16/8] place-items-center rounded-[30px] bg-poem-soft text-poem-700"><Newspaper size={54} /></div>
            )}

            <article className="mx-auto max-w-3xl">
              {paragraphs.map((paragraph: string, index: number) => (
                <p key={`${index}-${paragraph.slice(0, 24)}`} className="mb-6 text-lg leading-9 text-poem-muted">{paragraph}</p>
              ))}
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
