import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Participatory Organization for Empowering Marginalized (POEM) Pakistan.",
};

export default function ContactPage() {
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

            <form className="rounded-[32px] bg-poem-soft p-6 md:p-9">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-bold text-poem-900">
                  Full name
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-poem-700"
                  />
                </label>

                <label className="text-sm font-bold text-poem-900">
                  Email
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-poem-700"
                  />
                </label>
              </div>

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
                  rows={7}
                  placeholder="How can POEM help?"
                  className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-poem-700"
                />
              </label>

              <button
                type="button"
                className="mt-6 rounded-full bg-poem-950 px-7 py-4 text-sm font-extrabold text-white"
                title="Form submission will be connected in the backend phase"
              >
                Send inquiry
              </button>

              <p className="mt-4 text-xs leading-5 text-poem-muted">
                The form UI is complete. Submission and spam protection will be
                connected during the backend/admin phase.
              </p>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
