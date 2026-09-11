import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  MapPin,
  Quote,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const programs = [
  {
    icon: GraduationCap,
    number: "01",
    title: "Education & Youth",
    description:
      "Expanding opportunities for young people through education, skills development and learning.",
  },
  {
    icon: BriefcaseBusiness,
    number: "02",
    title: "Livelihoods & Skills",
    description:
      "Helping individuals develop practical skills and sustainable pathways to economic independence.",
  },
  {
    icon: Users,
    number: "03",
    title: "Community Empowerment",
    description:
      "Working with communities to strengthen participation, inclusion and locally-led development.",
  },
  {
    icon: Sprout,
    number: "04",
    title: "Resilience & Development",
    description:
      "Supporting resilient communities through sustainable and people-centered development initiatives.",
  },
];

const stats = [
  { value: "25K+", label: "People reached" },
  { value: "40+", label: "Communities" },
  { value: "20+", label: "Projects" },
  { value: "15+", label: "Partners" },
];

const projects = [
  {
    category: "Livelihoods",
    title: "Youth Skills & Economic Empowerment",
    location: "Mirpurkhas, Sindh",
    text: "Creating pathways for young people through market-oriented skills and community support.",
    accent: "bg-[#dfe9c5]",
  },
  {
    category: "Education",
    title: "Inclusive Community Learning",
    location: "Sindh, Pakistan",
    text: "Strengthening access to education and learning opportunities for underserved communities.",
    accent: "bg-[#e9dcc5]",
  },
  {
    category: "Community",
    title: "Community-Led Development",
    location: "Rural Sindh",
    text: "Working directly with communities to identify priorities and build sustainable local solutions.",
    accent: "bg-[#cfe1dd]",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-poem-950 text-white">
          <div className="hero-grid absolute inset-0 opacity-60" />

          <div className="absolute -right-40 -top-40 size-[520px] rounded-full border border-white/5" />
          <div className="absolute -right-24 -top-24 size-[360px] rounded-full border border-white/5" />

          <div className="container-poem relative grid min-h-[720px] items-center gap-14 py-20 lg:grid-cols-[1.12fr_.88fr] lg:py-24">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-poem-lime backdrop-blur">
                <Sparkles size={14} />
                PARTICIPATION • EMPOWERMENT • SUSTAINABILITY
              </div>

              <h1 className="text-balance max-w-4xl text-[clamp(3.2rem,7vw,6.7rem)] font-extrabold leading-[0.92] tracking-[-0.065em]">
                Communities
                <span className="block text-poem-lime">leading change.</span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/65 md:text-xl">
                POEM works alongside marginalized communities to expand
                opportunity, strengthen resilience and create sustainable
                pathways toward a better future.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#work"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-poem-lime px-7 py-4 text-sm font-extrabold text-poem-950 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  Explore our work
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="#projects"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  View projects
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -left-8 top-16 hidden rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl md:block">
                <p className="text-xs font-bold uppercase tracking-widest text-poem-lime">
                  Our approach
                </p>
                <p className="mt-1 text-sm font-bold">People before projects.</p>
              </div>

              <div className="overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.07] p-3 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="relative min-h-[500px] overflow-hidden rounded-[30px] bg-[#dce8cf] p-8 text-poem-950">
                  <div className="absolute -right-20 -top-14 size-72 rounded-full bg-poem-lime/60 blur-sm" />
                  <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-[#91baaa]/60" />

                  <div className="relative flex h-full min-h-[435px] flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/65 px-4 py-2 text-xs font-extrabold backdrop-blur">
                        SINCE COMMUNITY COMES FIRST
                      </span>

                      <div className="grid size-12 place-items-center rounded-full bg-poem-950 text-white">
                        <HandHeart size={21} />
                      </div>
                    </div>

                    <div>
                      <p className="max-w-[320px] text-3xl font-extrabold leading-[1.05] tracking-[-0.045em] md:text-4xl">
                        Development works when communities shape it.
                      </p>

                      <div className="mt-8 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white/65 p-5 backdrop-blur">
                          <p className="text-3xl font-black">04</p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-poem-700">
                            Focus areas
                          </p>
                        </div>

                        <div className="rounded-2xl bg-poem-950 p-5 text-white">
                          <ShieldCheck className="mb-5 text-poem-lime" />
                          <p className="text-xs font-bold leading-5 text-white/70">
                            Transparent. Inclusive. Community-led.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-5 rounded-2xl bg-poem-gold px-5 py-4 text-poem-950 shadow-xl">
                <p className="text-2xl font-black">SDGs</p>
                <p className="text-xs font-bold">Aligned development</p>
              </div>
            </div>
          </div>
        </section>

        {/* IMPACT STRIP */}
        <section id="impact" className="border-b border-black/5 bg-poem-cream">
          <div className="container-poem grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`py-9 md:py-11 ${
                  index !== 0 ? "border-l border-black/10 pl-6 md:pl-10" : ""
                }`}
              >
                <p className="text-3xl font-black tracking-[-0.05em] text-poem-950 md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-poem-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="section-space bg-white">
          <div className="container-poem grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                Who we are
              </p>

              <div className="mt-5 grid size-16 place-items-center rounded-2xl bg-poem-soft text-poem-800">
                <HeartHandshake size={30} />
              </div>
            </div>

            <div>
              <h2 className="text-balance max-w-4xl text-4xl font-extrabold leading-[1.06] tracking-[-0.05em] text-poem-950 md:text-6xl">
                We believe people should be{" "}
                <span className="text-poem-600">
                  participants in development,
                </span>{" "}
                not simply recipients of it.
              </h2>

              <div className="mt-10 grid gap-8 border-t border-black/10 pt-8 md:grid-cols-2">
                <p className="leading-7 text-poem-muted">
                  Participatory Organization for Empowering Marginalized works
                  with underserved communities to strengthen opportunity,
                  participation and long-term resilience.
                </p>

                <div>
                  {[
                    "Community-led solutions",
                    "Inclusive participation",
                    "Sustainable outcomes",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 border-b border-black/5 py-3 first:pt-0"
                    >
                      <div className="grid size-6 place-items-center rounded-full bg-poem-lime">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span className="font-bold text-poem-900">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORK */}
        <section
          id="work"
          className="soft-grid section-space bg-poem-soft"
        >
          <div className="container-poem">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                  Our work
                </p>

                <h2 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-[-0.05em] text-poem-950 md:text-6xl">
                  Creating opportunity where it matters.
                </h2>
              </div>

              <p className="max-w-md text-sm leading-7 text-poem-muted">
                Our programs connect immediate community priorities with
                sustainable long-term development.
              </p>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {programs.map((program) => {
                const Icon = program.icon;

                return (
                  <article
                    key={program.title}
                    className="group flex min-h-[390px] flex-col rounded-[28px] border border-black/[0.06] bg-white p-7 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-poem-950/10"
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid size-13 place-items-center rounded-2xl bg-poem-900 text-white">
                        <Icon size={23} />
                      </div>

                      <span className="text-xs font-extrabold text-poem-muted/60">
                        {program.number}
                      </span>
                    </div>

                    <div className="mt-auto">
                      <h3 className="text-2xl font-extrabold tracking-[-0.035em] text-poem-950">
                        {program.title}
                      </h3>

                      <p className="mt-4 text-sm leading-7 text-poem-muted">
                        {program.description}
                      </p>

                      <Link
                        href="#"
                        className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800"
                      >
                        Learn more
                        <ArrowUpRight
                          size={16}
                          className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                        />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="section-space bg-white">
          <div className="container-poem">
            <div className="flex items-end justify-between gap-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                  Projects
                </p>
                <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-poem-950 md:text-6xl">
                  Work in action.
                </h2>
              </div>

              <Link
                href="#"
                className="hidden items-center gap-2 text-sm font-extrabold text-poem-900 md:flex"
              >
                View all projects
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {projects.map((project, index) => (
                <article
                  key={project.title}
                  className="group overflow-hidden rounded-[30px] border border-black/[0.07] bg-white"
                >
                  <div
                    className={`relative h-64 overflow-hidden ${project.accent}`}
                  >
                    <div className="absolute inset-0 soft-grid" />

                    <div className="absolute bottom-6 left-6 grid size-14 place-items-center rounded-2xl bg-poem-950 text-white shadow-xl">
                      {index === 0 && <BriefcaseBusiness size={23} />}
                      {index === 1 && <BookOpen size={23} />}
                      {index === 2 && <Users size={23} />}
                    </div>

                    <div className="absolute right-6 top-6 rounded-full bg-white/75 px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-poem-950 backdrop-blur">
                      {project.category}
                    </div>
                  </div>

                  <div className="p-7">
                    <div className="flex items-center gap-2 text-xs font-bold text-poem-muted">
                      <MapPin size={14} />
                      {project.location}
                    </div>

                    <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-[-0.035em] text-poem-950">
                      {project.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-poem-muted">
                      {project.text}
                    </p>

                    <Link
                      href="#"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800"
                    >
                      View project
                      <ArrowUpRight
                        size={16}
                        className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* STORY */}
        <section className="section-space bg-poem-cream">
          <div className="container-poem">
            <div className="grid overflow-hidden rounded-[36px] bg-poem-900 text-white lg:grid-cols-[.9fr_1.1fr]">
              <div className="relative min-h-[390px] overflow-hidden bg-[#b7ccb5] p-8 md:min-h-[500px]">
                <div className="soft-grid absolute inset-0" />
                <div className="absolute -bottom-24 -right-12 size-80 rounded-full bg-poem-lime/70" />
                <div className="absolute left-8 top-8 rounded-full bg-white/70 px-4 py-2 text-xs font-extrabold text-poem-950 backdrop-blur">
                  COMMUNITY STORY
                </div>

                <div className="absolute bottom-8 left-8">
                  <div className="grid size-16 place-items-center rounded-2xl bg-white text-poem-900 shadow-xl">
                    <Quote size={27} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center p-8 md:p-14 lg:p-16">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-lime">
                  Stories of change
                </p>

                <blockquote className="mt-7 text-3xl font-extrabold leading-[1.18] tracking-[-0.04em] md:text-5xl">
                  “Sustainable change begins when communities have the tools
                  and confidence to shape their own future.”
                </blockquote>

                <div className="mt-9">
                  <p className="font-extrabold">Community Voices</p>
                  <p className="mt-1 text-sm text-white/50">
                    POEM Pakistan
                  </p>
                </div>

                <Link
                  href="#"
                  className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-bold transition hover:bg-white hover:text-poem-950"
                >
                  Read impact stories
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* RESOURCES */}
        <section id="resources" className="section-space bg-white">
          <div className="container-poem grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                Accountability
              </p>

              <h2 className="mt-4 max-w-xl text-4xl font-extrabold tracking-[-0.05em] text-poem-950 md:text-6xl">
                Transparency builds trust.
              </h2>

              <p className="mt-6 max-w-lg text-base leading-8 text-poem-muted">
                Reports, policies, publications and organizational documents
                should be easy for communities, partners and donors to access.
              </p>
            </div>

            <div className="rounded-[32px] bg-poem-soft p-5 md:p-7">
              {[
                ["Annual Reports", "Institutional progress & results"],
                ["Project Reports", "Activities, outcomes & learning"],
                ["Policies", "Governance & accountability"],
                ["Publications", "Research, case studies & resources"],
              ].map(([title, description]) => (
                <Link
                  key={title}
                  href="#"
                  className="group flex items-center justify-between gap-5 border-b border-poem-900/10 py-5 first:pt-2 last:border-0"
                >
                  <div>
                    <h3 className="font-extrabold text-poem-950">{title}</h3>
                    <p className="mt-1 text-xs text-poem-muted">
                      {description}
                    </p>
                  </div>

                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-poem-900 transition group-hover:bg-poem-900 group-hover:text-white">
                    <ArrowUpRight size={17} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="donate" className="bg-poem-lime">
          <div className="container-poem flex flex-col justify-between gap-8 py-16 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-poem-700">
                Get involved
              </p>

              <h2 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1] tracking-[-0.05em] text-poem-950 md:text-6xl">
                Help communities turn opportunity into lasting change.
              </h2>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-poem-950 px-7 py-4 text-sm font-extrabold text-white transition hover:-translate-y-1"
              >
                Support POEM
                <ArrowUpRight size={17} />
              </Link>

              <Link
                href="#contact"
                className="inline-flex items-center justify-center rounded-full border border-poem-950/20 px-7 py-4 text-sm font-extrabold text-poem-950"
              >
                Partner with us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}