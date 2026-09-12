import { Download, FileText, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { deleteGrantAgreement } from "@/app/admin/grant-management-actions";
import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { AgreementForm, GrantAwardForm } from "@/components/admin/grant-forms";
import { GrantTabs } from "@/components/admin/grant-tabs";
import { requireSiteAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export default async function GrantDetailPage({ params, searchParams }: { params: Promise<{id:string}>; searchParams: Promise<{saved?:string;created?:string;agreement?:string;agreement_deleted?:string;error?:string}> }) {
  const {id}=await params; const q=await searchParams; const {supabase}=await requireSiteAdmin();
  const [{data:grant},{data:applications},{data:donors},{data:projects},{data:programs},{data:agreements}] = await Promise.all([
    supabase.from("grant_awards").select("*").eq("id",id).maybeSingle(),
    supabase.from("grant_applications").select("id,title,stage").order("title"),
    supabase.from("fundraising_donors").select("id,name").order("name"),
    supabase.from("projects").select("id,title").order("title"),
    supabase.from("programs").select("id,title").order("title"),
    supabase.from("grant_agreements").select("*").eq("grant_id",id).order("created_at",{ascending:false}),
  ]);
  if(!grant) notFound();
  return <div className="mx-auto max-w-6xl"><AdminPageHeader eyebrow="Grant Management" title={grant.title} description="Award details and private grant agreements."/><GrantTabs grantId={id} active="overview"/>{q.created?<Notice>Grant award created.</Notice>:null}{q.saved?<Notice>Grant saved.</Notice>:null}{q.agreement?<Notice>Agreement added.</Notice>:null}{q.agreement_deleted?<Notice>Agreement deleted.</Notice>:null}{q.error?<Notice tone="error">{q.error}</Notice>:null}<div className="mt-7"><GrantAwardForm award={grant} applications={(applications??[]).map(x=>({id:x.id,label:`${x.title} · ${x.stage.replaceAll("_"," ")}`}))} donors={(donors??[]).map(x=>({id:x.id,label:x.name}))} projects={(projects??[]).map(x=>({id:x.id,label:x.title}))} programs={(programs??[]).map(x=>({id:x.id,label:x.title}))}/></div><section className="mt-8 rounded-[24px] border border-black/[0.06] bg-white p-6"><h2 className="font-extrabold text-poem-950">Grant agreements & amendments</h2><p className="mt-2 text-sm text-poem-muted">Agreement files remain private in the fundraising workspace.</p><div className="mt-5"><AgreementForm grantId={id} currency={grant.currency}/></div><div className="mt-6 divide-y divide-black/5">{(agreements??[]).map(a=><AgreementRow key={a.id} agreement={a} grantId={id}/>)}{!agreements?.length?<p className="py-6 text-sm text-poem-muted">No agreements recorded yet.</p>:null}</div></section></div>;
}

async function AgreementRow({agreement,grantId}:{agreement:{id:string;agreement_type:string;title:string;reference_number:string;signed_date:string|null;storage_path:string|null;size_bytes:number};grantId:string}){const supabase=await createClient(); const signed=agreement.storage_path?await supabase.storage.from("grant-documents").createSignedUrl(agreement.storage_path,600):null; return <div className="flex flex-col justify-between gap-4 py-4 md:flex-row md:items-center"><div className="flex gap-3"><div className="grid size-10 place-items-center rounded-xl bg-poem-soft text-poem-800"><FileText size={17}/></div><div><p className="font-extrabold text-poem-950">{agreement.title}</p><p className="mt-1 text-xs capitalize text-poem-muted">{agreement.agreement_type.replaceAll("_"," ")}{agreement.reference_number?` · ${agreement.reference_number}`:""}{agreement.signed_date?` · Signed ${agreement.signed_date}`:""}</p></div></div><div className="flex gap-2">{signed?.data?.signedUrl?<a href={signed.data.signedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-extrabold text-poem-900"><Download size={14}/>Open</a>:null}<form action={deleteGrantAgreement}><input type="hidden" name="grant_id" value={grantId}/><input type="hidden" name="agreement_id" value={agreement.id}/><button className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-extrabold text-red-700"><Trash2 size={14}/>Delete</button></form></div></div>}
