import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatBytes } from "@/lib/media";
import { getPublicResourceBySlug } from "@/lib/public-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getPublicResourceBySlug(slug);

  return resource
    ? { title: resource.title, description: resource.description }
    : { title: "Resource not found" };
}

export default async function ResourceDetailPage({ params }: Props) {
  const { slug } = await params;
  const resource = await getPublicResourceBySlug(slug);

  if (!resource) notFound();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-poem-950 text-white">
          <div className="container-poem py-16 md:py-24">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white"
            >
              <ArrowLeft size={16} />
              All resources
            </Link>

            <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.18em] text-poem-lime">
              {resource.category} · {resource.year}
            </p>

            <h1 className="mt-4 max-w-5xl text-balance text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] md:text-7xl">
              {resource.title}
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/65">
              {resource.description}
            </p>
          </div>
        </section>

        <section className="section-space bg-white">
          <div className="container-poem grid gap-8 lg:grid-cols-[1fr_.7fr]">
            <div>
              {resource.coverUrl ? (
                <div
                  className="aspect-[16/9] rounded-[30px] bg-poem-soft bg-cover bg-center"
                  style={{ backgroundImage: `url("${resource.coverUrl}")` }}
                  role="img"
                  aria-label={resource.coverAlt || resource.title}
                />
              ) : (
                <div className="grid aspect-[16/9] place-items-center rounded-[30px] bg-poem-soft text-poem-800">
                  <FileText size={54} />
                </div>
              )}
            </div>

            <aside className="rounded-[28px] bg-poem-soft p-7">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-poem-700">
                Download
              </p>

              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.035em] text-poem-950">
                Resource document
              </h2>

              {resource.fileName ? (
                <p className="mt-4 text-sm leading-6 text-poem-muted">
                  {resource.fileName}
                  {resource.fileSize
                    ? ` · ${formatBytes(resource.fileSize)}`
                    : ""}
                </p>
              ) : null}

              {resource.downloadUrl ? (
                <a
                  href={resource.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-poem-950 px-6 py-3 text-sm font-extrabold text-white"
                >
                  <Download size={16} />
                  Open PDF
                </a>
              ) : (
                <p className="mt-6 text-sm font-bold text-poem-muted">
                  No PDF has been attached to this resource.
                </p>
              )}
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
