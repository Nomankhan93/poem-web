import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="bg-poem-cream">
        <div className="container-poem grid min-h-[62vh] place-items-center py-20 text-center">
          <div>
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-poem-soft text-poem-800">
              <SearchX size={28} />
            </div>
            <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
              404
            </p>
            <h1 className="mt-3 text-5xl font-extrabold tracking-[-0.055em] text-poem-950">
              Page not found.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-poem-muted">
              The page may have moved, been unpublished or no longer
              exists.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-poem-950 px-6 py-3 text-sm font-extrabold text-white"
            >
              <ArrowLeft size={15} />
              Return home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
