import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Clock3, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCareer } from "@/lib/organization-content";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const career = await getCareer(slug);
  return career ? { title: career.title, description: career.summary } : { title: "Vacancy not found" };
}

export default async function CareerDetailPage({ params }: Props) {
  const { slug } = await params;
  const career = await getCareer(slug);
  if (!career) notFound();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-poem-950 text-white">
          <div className="container-poem py-16 md:py-24">
            <Link href="/careers" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white"><ArrowLeft size={16} />All careers</Link>
            <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.18em] text-poem-lime">Career opportunity</p>
            <h1 className="mt-4 max-w-5xl text-balance text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] md:text-7xl">{career.title}</h1>
            <div className="mt-7 flex flex-wrap gap-5 text-sm font-bold text-poem-lime">
              {career.department ? <span className="inline-flex items-center gap-2"><BriefcaseBusiness size={15} />{career.department}</span> : null}
              {career.location ? <span className="inline-flex items-center gap-2"><MapPin size={15} />{career.location}</span> : null}
              {career.deadline ? <span className="inline-flex items-center gap-2"><Clock3 size={15} />Deadline {new Date(career.deadline).toLocaleDateString()}</span> : null}
            </div>
          </div>
        </section>

        <section className="section-space bg-white">
          <div className="container-poem grid gap-10 lg:grid-cols-[1fr_.6fr]">
            <article>
              <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-poem-950">About the role</h2>
              <p className="mt-5 whitespace-pre-wrap text-lg leading-9 text-poem-muted">{career.description}</p>

              <h2 className="mt-12 text-3xl font-extrabold tracking-[-0.04em] text-poem-950">Requirements</h2>
              <p className="mt-5 whitespace-pre-wrap text-lg leading-9 text-poem-muted">{career.requirements}</p>
            </article>

            <aside className="rounded-[28px] bg-poem-soft p-7">
              <h2 className="text-2xl font-extrabold text-poem-950">How to apply</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-poem-muted">{career.apply_instructions}</p>
              {career.apply_url ? (
                <a href={career.apply_url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-poem-950 px-6 py-3 text-sm font-extrabold text-white">
                  Apply now <ArrowUpRight size={15} />
                </a>
              ) : null}
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
