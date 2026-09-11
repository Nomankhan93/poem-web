import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa6";
import { PageHero, SectionHeading } from "@/components/inner-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getTeamMembers } from "@/lib/organization-content";

export const metadata: Metadata = {
  title: "Team & Board",
  description: "Meet the team, board and advisors of POEM Pakistan.",
};

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const members = await getTeamMembers();
  const groups = [
    { key: "board", label: "Board & Governance" },
    { key: "team", label: "Team" },
    { key: "advisor", label: "Advisors" },
  ];

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="People"
          title="Leadership grounded in purpose."
          description="Meet the people responsible for POEM's governance, strategy and program delivery."
        />

        {groups.map((group) => {
          const groupMembers = members.filter((member) => member.memberType === group.key);
          if (!groupMembers.length) return null;

          return (
            <section key={group.key} className="section-space border-b border-black/5 bg-white">
              <div className="container-poem">
                <SectionHeading eyebrow={group.label} title={group.label} />

                <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {groupMembers.map((member) => (
                    <article key={member.id} className="overflow-hidden rounded-[28px] border border-black/[0.07]">
                      {member.photoUrl ? (
                        <div className="aspect-[4/4.5] bg-poem-soft bg-cover bg-center" style={{ backgroundImage: `url("${member.photoUrl}")` }} role="img" aria-label={member.name} />
                      ) : (
                        <div className="grid aspect-[4/4.5] place-items-center bg-poem-soft text-poem-700">
                          <UserRound size={52} />
                        </div>
                      )}

                      <div className="p-6">
                        <h2 className="text-2xl font-extrabold tracking-[-0.035em] text-poem-950">{member.name}</h2>
                        <p className="mt-1 text-sm font-bold text-poem-700">{member.roleTitle}</p>
                        <p className="mt-4 text-sm leading-7 text-poem-muted">{member.bio}</p>

                        {member.linkedinUrl ? (
                          <a href={member.linkedinUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-poem-800">
                            <FaLinkedinIn size={15} /> LinkedIn
                          </a>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {!members.length ? (
          <section className="section-space bg-white">
            <div className="container-poem rounded-[28px] bg-poem-soft p-10 text-center text-poem-muted">
              Team profiles will appear here once published.
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
