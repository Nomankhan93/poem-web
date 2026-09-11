import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa6";
import { PoemLogo } from "@/components/brand/poem-logo";
import { getSiteSettings } from "@/lib/site-settings";

const quickLinks = [
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/projects", label: "Projects" },
  { href: "/impact", label: "Impact" },
  { href: "/resources", label: "Resources" },
  { href: "/stories", label: "Stories" },
  { href: "/news", label: "News" },
];

const actionLinks = [
  { href: "/careers", label: "Careers" },
  { href: "/tenders", label: "Tenders" },
  { href: "/contact", label: "Contact" },
  { href: "/donate", label: "Donate" },
  { href: "/admin/login", label: "Admin" },
];

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

  const social = [
    settings.facebook_url
      ? {
          href: settings.facebook_url,
          label: "Facebook",
          icon: FaFacebookF,
        }
      : null,
    settings.linkedin_url
      ? {
          href: settings.linkedin_url,
          label: "LinkedIn",
          icon: FaLinkedinIn,
        }
      : null,
  ].filter(Boolean) as {
    href: string;
    label: string;
    icon: typeof FaFacebookF;
  }[];

  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="container-poem py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr_.8fr_1fr]">
          <div>
            <PoemLogo
              href="/"
              variant="horizontal"
              size="lg"
              imageClassName="max-h-20 w-auto object-contain"
            />
            <p className="mt-5 max-w-md text-sm leading-7 text-poem-muted">
              Participatory Organization for Empowering Marginalized works with
              communities through inclusive development, partnerships and public
              accountability.
            </p>

            {social.length ? (
              <div className="mt-6 flex items-center gap-3">
                {social.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid size-11 place-items-center rounded-full border border-black/10 text-poem-900 transition hover:bg-poem-soft"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-poem-800">
              Explore
            </h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-poem-muted transition hover:text-poem-950"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-poem-800">
              Quick actions
            </h3>
            <ul className="mt-5 space-y-3">
              {actionLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-poem-muted transition hover:text-poem-950"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-poem-800">
              Contact
            </h3>
            <div className="mt-5 space-y-4 text-sm text-poem-muted">
              {location ? (
                <div className="flex gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-poem-900" />
                  <span>{location}</span>
                </div>
              ) : null}

              {settings.email ? (
                <div className="flex gap-3">
                  <Mail size={18} className="mt-0.5 shrink-0 text-poem-900" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="transition hover:text-poem-950"
                  >
                    {settings.email}
                  </a>
                </div>
              ) : null}

              {settings.phone ? (
                <div className="flex gap-3">
                  <Phone size={18} className="mt-0.5 shrink-0 text-poem-900" />
                  <a
                    href={`tel:${settings.phone}`}
                    className="transition hover:text-poem-950"
                  >
                    {settings.phone}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-black/5 pt-6 text-sm text-poem-muted">
          <p>© {new Date().getFullYear()} POEM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
