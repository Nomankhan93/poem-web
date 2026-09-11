import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { submitContactMessage } from "@/app/contact/actions";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Participatory Organization for Empowering Marginalized (POEM) Pakistan.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Contact"
          title="Start a conversation with POEM."
          description="For partnerships, program inquiries, opportunities, community engagement or general information, use the contact details or inquiry form below."
        />

        <section className="section-space bg-white">
          <div className="container-poem grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <SectionHeading
                eyebrow="Get in touch"
                title="We'd like to hear from you."
              />

              <div className="mt-10 space-y-4">
                {[
                  {
                    icon: MapPin,
                    label: "Office",
                    value: "Mirpurkhas, Sindh, Pakistan",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "info@thepoempk.com",
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: "Add verified POEM contact number",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex gap-4 rounded-2xl bg-poem-soft p-5"
                  >
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-poem-900">
                      <Icon size={19} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-poem-700">
                        {label}
                      </p>
                      <p className="mt-1 font-bold text-poem-950">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {params.sent ? (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
                  Thank you. Your message has been submitted to POEM.
                </div>
              ) : null}

              {params.error ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                  {params.error}
                </div>
              ) : null}

              <form
                action={submitContactMessage}
                className="rounded-[32px] bg-poem-soft p-6 md:p-9"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-bold text-poem-900">
                    Full name
                    <input
                      type="text"
                      name="name"
                      required
                      minLength={2}
                      maxLength={120}
                      placeholder="Your name"
                      className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-poem-700"
                    />
                  </label>

                  <label className="text-sm font-bold text-poem-900">
                    Email
                    <input
                      type="email"
                      name="email"
                      required
                      maxLength={254}
                      placeholder="you@example.com"
                      className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-poem-700"
                    />
                  </label>
                </div>

                <label className="mt-5 block text-sm font-bold text-poem-900">
                  Phone <span className="font-normal text-poem-muted">(optional)</span>
                  <input
                    type="tel"
                    name="phone"
                    maxLength={40}
                    placeholder="+92 ..."
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-poem-700"
                  />
                </label>

                <label className="mt-5 block text-sm font-bold text-poem-900">
                  Inquiry type
                  <select
                    name="inquiryType"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-poem-700"
                    defaultValue="General inquiry"
                  >
                    <option>General inquiry</option>
                    <option>Partnership</option>
                    <option>Programs & projects</option>
                    <option>Careers</option>
                    <option>Tenders / procurement</option>
                    <option>Donations</option>
                  </select>
                </label>

                <label className="mt-5 block text-sm font-bold text-poem-900">
                  Message
                  <textarea
                    name="message"
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={7}
                    placeholder="How can POEM help?"
                    className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-poem-700"
                  />
                </label>

                <button
                  type="submit"
                  className="mt-6 rounded-full bg-poem-950 px-7 py-4 text-sm font-extrabold text-white"
                >
                  Send inquiry
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
