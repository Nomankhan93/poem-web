import {
  ArrowUpRight,
  Mail,
  MapPin,
} from "lucide-react";
import Link from "next/link";

import {
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa6";

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="overflow-hidden bg-poem-950 text-white"
    >
      <div className="container-poem">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.4fr_.7fr_.7fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-poem-lime text-xl font-black text-poem-950">
                P
              </div>

              <div>
                <div className="text-2xl font-black tracking-[-0.04em]">
                  POEM
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  Pakistan
                </div>
              </div>
            </Link>

            <p className="mt-6 max-w-md text-base leading-7 text-white/60">
              Working alongside marginalized communities to create inclusive,
              resilient and sustainable pathways toward opportunity.
            </p>

            <div className="mt-7 flex gap-3">
              {[FaFacebookF, FaLinkedinIn].map((Icon, index) => (
                <button
                  key={index}
                  className="grid size-10 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-poem-lime hover:bg-poem-lime hover:text-poem-950"
                >
                  <Icon size={17} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-poem-lime">
              Explore
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
              <Link href="#about" className="hover:text-white">
                About POEM
              </Link>
              <Link href="#work" className="hover:text-white">
                Our Work
              </Link>
              <Link href="#projects" className="hover:text-white">
                Projects
              </Link>
              <Link href="#impact" className="hover:text-white">
                Our Impact
              </Link>
              <Link href="#resources" className="hover:text-white">
                Reports & Resources
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-poem-lime">
              Get in touch
            </p>

            <div className="mt-5 space-y-4 text-sm text-white/65">
              <p className="flex gap-3">
                <MapPin className="mt-0.5 shrink-0" size={18} />
                Mirpurkhas, Sindh, Pakistan
              </p>

              <p className="flex gap-3">
                <Mail className="mt-0.5 shrink-0" size={18} />
                info@thepoempk.com
              </p>
            </div>

            <Link
              href="#"
              className="mt-6 inline-flex items-center gap-2 font-bold text-poem-lime"
            >
              Contact POEM
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-white/10 py-7 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} POEM Pakistan.</p>
          <p>Participatory Organization for Empowering Marginalized</p>
        </div>
      </div>
    </footer>
  );
}