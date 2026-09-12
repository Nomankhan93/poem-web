import { AdminPageHeader, Notice } from "@/components/admin/admin-ui";
import { GrantAwardForm } from "@/components/admin/grant-forms";
import { requireSiteAdmin } from "@/lib/admin/auth";

export default async function NewGrantPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams; const { supabase } = await requireSiteAdmin();
  const [{data:applications},{data:donors},{data:projects},{data:programs}] = await Promise.all([
    supabase.from("grant_applications").select("id,title,stage").in("stage",["submitted","under_review","clarification_requested","shortlisted","awarded"]).order("title"),
    supabase.from("fundraising_donors").select("id,name").order("name"),
    supabase.from("projects").select("id,title").order("title"),
    supabase.from("programs").select("id,title").order("title"),
  ]);
  return <div className="mx-auto max-w-5xl"><AdminPageHeader eyebrow="Fundraising & Grants" title="Create grant award" description="Convert a successful application or record a direct grant award."/>{params.error?<Notice tone="error">{params.error}</Notice>:null}<div className="mt-7"><GrantAwardForm applications={(applications??[]).map(x=>({id:x.id,label:`${x.title} · ${x.stage.replaceAll("_"," ")}`}))} donors={(donors??[]).map(x=>({id:x.id,label:x.name}))} projects={(projects??[]).map(x=>({id:x.id,label:x.title}))} programs={(programs??[]).map(x=>({id:x.id,label:x.title}))}/></div></div>;
}
