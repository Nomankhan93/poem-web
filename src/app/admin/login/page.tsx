import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { signIn } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Admin Login | POEM",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen bg-poem-950 lg:grid-cols-[.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="hero-grid absolute inset-0 opacity-50" />
        <div className="relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to website
          </Link>
        </div>

        <div className="relative max-w-xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-poem-lime">
            POEM Administration
          </p>
          <h1 className="mt-5 text-6xl font-extrabold leading-[0.95] tracking-[-0.06em]">
            Manage the work behind the story.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-white/60">
            Projects, programs and community inquiries are managed from one
            secure workspace.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#f4f6f2] p-5 md:p-10">
        <div className="w-full max-w-md rounded-[30px] bg-white p-7 shadow-2xl shadow-black/10 md:p-9">
          <div className="grid size-13 place-items-center rounded-2xl bg-poem-soft text-poem-900">
            <LockKeyhole size={22} />
          </div>

          <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
            Secure access
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-poem-950">
            Sign in to POEM Admin
          </h2>

          {params.error ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
              {params.error}
            </div>
          ) : null}

          <form action={signIn} className="mt-7 space-y-5">
            <label className="block text-sm font-bold text-poem-900">
              Email
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3.5 font-normal outline-none focus:border-poem-700"
              />
            </label>

            <label className="block text-sm font-bold text-poem-900">
              Password
              <input
                type="password"
                name="password"
                required
                minLength={6}
                autoComplete="current-password"
                className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3.5 font-normal outline-none focus:border-poem-700"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-poem-950 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-poem-800"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-xs leading-5 text-poem-muted">
            Admin accounts are created by an authorized administrator. Public
            self-registration is intentionally not available here.
          </p>

          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-poem-700 lg:hidden"
          >
            <ArrowLeft size={15} />
            Back to website
          </Link>
        </div>
      </section>
    </main>
  );
}
