import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { requireSiteAdmin } from "@/lib/admin/auth";
import { formatGrantMoney } from "@/lib/grants";

export default async function GrantsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const params = await searchParams;
  const { supabase } = await requireSiteAdmin();
  const { data: grants } = await supabase
    .from("grant_awards")
    .select("id,title,award_number,status,award_amount,currency,start_date,end_date,grant_manager,donor:fundraising_donors(name),project:projects(title)")
    .order("created_at", { ascending: false });

  return <div><AdminPageHeader eyebrow="Fundraising & Grants" title="Grant awards" description="Manage awarded funding, agreements, installments, funds received, reporting and impact." action={<Link href="/admin/fundraising/grants/new" className="inline-flex items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-sm font-extrabold text-white">New grant award<ArrowUpRight size={15}/></Link>}/>{params.saved?<Notice>Grant saved.</Notice>:null}{params.error?<Notice tone="error">{params.error}</Notice>:null}<div className="mt-7 space-y-4">{(grants??[]).map(grant=>{const donorRel=grant.donor as unknown as {name:string}|{name:string}[]|null; const donor=Array.isArray(donorRel)?donorRel[0]??null:donorRel; const projectRel=grant.project as unknown as {title:string}|{title:string}[]|null; const project=Array.isArray(projectRel)?projectRel[0]??null:projectRel; return <Link key={grant.id} href={`/admin/fundraising/grants/${grant.id}`} className="grid gap-4 rounded-[24px] border border-black/[0.06] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><p className="font-extrabold text-poem-950">{grant.title}</p><span className="rounded-full bg-poem-soft px-3 py-1 text-[10px] font-extrabold uppercase text-poem-800">{grant.status.replaceAll("_"," ")}</span></div><p className="mt-2 text-xs text-poem-muted">{donor?.name||"Donor not assigned"}{project?.title?` · ${project.title}`:""}{grant.grant_manager?` · Manager: ${grant.grant_manager}`:""}</p></div><div className="lg:text-right"><p className="font-black text-poem-950">{formatGrantMoney(grant.award_amount,grant.currency)}</p><p className="mt-1 text-xs text-poem-muted">{grant.start_date||"—"} → {grant.end_date||"—"}</p></div></Link>})}{!grants?.length?<div className="rounded-[24px] bg-white p-8 text-center text-sm text-poem-muted">No grant awards recorded yet.</div>:null}</div></div>;
}
