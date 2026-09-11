"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("POEM route error:", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-poem-cream px-5 py-16">
      <div className="w-full max-w-xl rounded-[30px] bg-white p-8 text-center shadow-xl shadow-black/5 md:p-10">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-700">
          <AlertTriangle size={24} />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.045em] text-poem-950">
          Something went wrong.
        </h1>
        <p className="mt-4 text-sm leading-7 text-poem-muted">
          The page could not be completed. You can try again or
          return to the POEM homepage.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-poem-950 px-6 py-3 text-sm font-extrabold text-white"
          >
            <RotateCcw size={15} />
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-black/10 px-6 py-3 text-sm font-extrabold text-poem-900"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
