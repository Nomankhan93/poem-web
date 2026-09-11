import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import {
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa6";
import { getSiteSettings } from "@/lib/site-settings";

export async function SiteFooter() {
  const settings = await getSiteSettings();

  const location = [
    settings.address,
    settings.city,
    settings.province,
    settings.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <footer className="overflow-hidden bg-poem-950 text-white">
      <div className="container-poem">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.25fr_.65fr_.65fr_.8fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-poem-lime text-xl font-black text-poem-950">
                {settings.short_name.slice(0, 1)}
              </div>
              <div>
                <div className="text-2xl font-black tracking-[-0.04em]">
                  {settings.short_name}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  Pakistan
                </div>
              </div>
            </Link>

            <p className="mt-6 max-w-sm text-base leading-7 text-white/60">
              {settings.tagline}
            </p>

            <div className="mt-7 flex gap-3">
              {settings.facebook_url ? (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="grid size-10 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-poem-lime hover:bg-poem-lime hover:text-poem-950"
                >
                  <FaFacebookF size={16} />
                </a>
              ) : null}

              {settings.linkedin_url ? (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="grid size-10 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-poem-lime hover:bg-poem-lime hover:text-poem-950"
                >
                  <FaLinkedinIn size={16} />
                </a>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-poem-lime">
              Organization
            </p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
              <Link href="/about" className="hover:text-white">
                About
              </Link>
              <Link href="/about/team" className="hover:text-white">
                Team & Board
              </Link>
              <Link href="/programs" className="hover:text-white">
                Programs
              </Link>
              <Link href="/projects" className="hover:text-white">
                Projects
              </Link>
              <Link href="/partners" className="hover:text-white">
                Partners
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-poem-lime">
              Explore
            </p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
              <Link href="/impact" className="hover:text-white">
                Impact
              </Link>
              <Link href="/stories" className="hover:text-white">
                Stories
              </Link>
              <Link href="/news" className="hover:text-white">
                News
              </Link>
              <Link href="/resources" className="hover:text-white">
                Resources
              </Link>
              <Link href="/careers" className="hover:text-white">
                Careers
              </Link>
              <Link href="/tenders" className="hover:text-white">
                Tenders
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-poem-lime">
              Get in touch
            </p>

            <div className="mt-5 space-y-4 text-sm text-white/65">
              {location ? (
                <p className="flex gap-3">
                  <MapPin
                    className="mt-0.5 shrink-0"
                    size={18}
                  />
                  {location}
                </p>
              ) : null}

              {settings.email ? (
                <p className="flex gap-3">
                  <Mail
                    className="mt-0.5 shrink-0"
                    size={18}
                  />
                  {settings.email}
                </p>
              ) : null}

              {settings.phone ? (
                <p className="flex gap-3">
                  <Phone
                    className="mt-0.5 shrink-0"
                    size={18}
                  />
                  {settings.phone}
                </p>
              ) : null}
            </div>

            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 font-bold text-poem-lime"
            >
              Contact POEM
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-white/10 py-7 text-xs text-white/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.short_name} Pakistan.
          </p>
          <p>{settings.organization_name}</p>
        </div>
      </div>
    </footer>
  );
}
