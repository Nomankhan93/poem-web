"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSiteAdmin } from "@/lib/admin/auth";
import { splitList } from "@/lib/fundraising";

const val = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const nullable = (f: FormData, k: string) => val(f,k) || null;
const money = (f: FormData, k: string) => { const r=val(f,k); if(!r) return null; const n=Number(r); return Number.isFinite(n)&&n>=0?n:null; };
const positiveInt = (f: FormData,k:string) => { const r=val(f,k); if(!r) return null; const n=Number(r); return Number.isInteger(n)&&n>0?n:null; };
function fail(path:string,msg:string):never { redirect(`${path}?error=${encodeURIComponent(msg)}`); }

export async function saveDonor(f: FormData) {
  const { supabase, user } = await requireSiteAdmin(); const id=val(f,"id"); const path="/admin/fundraising/donors";
  const payload={ name:val(f,"name"), donor_type:val(f,"donor_type")||"other", country:val(f,"country"), website_url:val(f,"website_url"),
    contact_person:val(f,"contact_person"), contact_title:val(f,"contact_title"), contact_email:val(f,"contact_email"), contact_phone:val(f,"contact_phone"),
    funding_areas:splitList(f.get("funding_areas")), preferred_sdgs:splitList(f.get("preferred_sdgs")), preferred_geographies:splitList(f.get("preferred_geographies")),
    typical_grant_min:money(f,"typical_grant_min"), typical_grant_max:money(f,"typical_grant_max"), currency:val(f,"currency")||"USD", funding_cycle:val(f,"funding_cycle"),
    relationship_status:val(f,"relationship_status")||"prospect", notes:val(f,"notes") };
  if(!payload.name) fail(path,"Donor name is required."); if(payload.website_url&&!payload.website_url.startsWith("https://")) fail(path,"Website must use https://");
  const result=id?await supabase.from("fundraising_donors").update(payload).eq("id",id):await supabase.from("fundraising_donors").insert({...payload,created_by:user.id});
  if(result.error) fail(path,result.error.message); revalidatePath("/admin/fundraising"); revalidatePath(path); redirect(`${path}?saved=1`);
}

export async function saveOpportunity(f: FormData) {
  const { supabase, user } = await requireSiteAdmin(); const id=val(f,"id"); const path="/admin/fundraising/opportunities";
  const payload={ donor_id:nullable(f,"donor_id"), title:val(f,"title"), funding_program:val(f,"funding_program"), reference_number:val(f,"reference_number"), source_url:val(f,"source_url"),
    currency:val(f,"currency")||"USD", minimum_grant:money(f,"minimum_grant"), maximum_grant:money(f,"maximum_grant"), eligible_locations:splitList(f.get("eligible_locations")),
    eligible_themes:splitList(f.get("eligible_themes")), relevant_sdgs:splitList(f.get("relevant_sdgs")), opening_date:nullable(f,"opening_date"), deadline:nullable(f,"deadline"),
    eligibility_notes:val(f,"eligibility_notes"), internal_notes:val(f,"internal_notes"), responsible_person:val(f,"responsible_person"), priority:val(f,"priority")||"medium", status:val(f,"status")||"identified" };
  if(!payload.title) fail(path,"Opportunity title is required."); if(payload.source_url&&!payload.source_url.startsWith("https://")) fail(path,"Source link must use https://");
  const result=id?await supabase.from("funding_opportunities").update(payload).eq("id",id):await supabase.from("funding_opportunities").insert({...payload,created_by:user.id});
  if(result.error) fail(path,result.error.message); revalidatePath("/admin/fundraising"); revalidatePath("/admin/fundraising/deadlines"); revalidatePath(path); redirect(`${path}?saved=1`);
}

export async function saveApplication(f: FormData) {
  const { supabase, user } = await requireSiteAdmin(); const id=val(f,"id"); const path="/admin/fundraising/applications";
  const payload={ opportunity_id:nullable(f,"opportunity_id"), donor_id:nullable(f,"donor_id"), project_id:nullable(f,"project_id"), program_id:nullable(f,"program_id"), title:val(f,"title"),
    stage:val(f,"stage")||"draft", requested_amount:money(f,"requested_amount"), currency:val(f,"currency")||"USD", project_duration_months:positiveInt(f,"project_duration_months"),
    proposal_summary:val(f,"proposal_summary"), objectives:val(f,"objectives"), expected_outcomes:val(f,"expected_outcomes"), target_population:val(f,"target_population"),
    geographic_area:val(f,"geographic_area"), relevant_sdgs:splitList(f.get("relevant_sdgs")), lead_person:val(f,"lead_person"), submission_deadline:nullable(f,"submission_deadline"),
    submitted_at:nullable(f,"submitted_at"), decision_date:nullable(f,"decision_date"), decision_notes:val(f,"decision_notes"), internal_notes:val(f,"internal_notes") };
  if(!payload.title) fail(path,"Application title is required.");
  if(id){ const {error}=await supabase.from("grant_applications").update(payload).eq("id",id); if(error) fail(`${path}/${id}`,error.message); revalidatePath(path); redirect(`${path}/${id}?saved=1`); }
  const {data,error}=await supabase.from("grant_applications").insert({...payload,created_by:user.id}).select("id").single(); if(error||!data) fail(path,error?.message??"Could not create application.");
  revalidatePath("/admin/fundraising"); revalidatePath(path); redirect(`${path}/${data.id}?saved=1`);
}

export async function toggleChecklistItem(f:FormData){
  const {supabase,user}=await requireSiteAdmin(); const itemId=val(f,"item_id"); const appId=val(f,"application_id"); const completed=val(f,"completed")==="true";
  const {error}=await supabase.from("grant_application_checklist").update({completed,completed_at:completed?new Date().toISOString():null,completed_by:completed?user.id:null}).eq("id",itemId).eq("application_id",appId);
  if(error) fail(`/admin/fundraising/applications/${appId}`,error.message); revalidatePath(`/admin/fundraising/applications/${appId}`); redirect(`/admin/fundraising/applications/${appId}?checklist=1`);
}

export async function deleteGrantDocument(f:FormData){
  const {supabase}=await requireSiteAdmin(); const docId=val(f,"document_id"); const appId=val(f,"application_id");
  const {data:doc,error:lookup}=await supabase.from("grant_application_documents").select("storage_path").eq("id",docId).eq("application_id",appId).maybeSingle();
  if(lookup||!doc) fail(`/admin/fundraising/applications/${appId}`,lookup?.message??"Document not found.");
  const {error:storageError}=await supabase.storage.from("grant-documents").remove([doc.storage_path]); if(storageError) fail(`/admin/fundraising/applications/${appId}`,storageError.message);
  const {error}=await supabase.from("grant_application_documents").delete().eq("id",docId); if(error) fail(`/admin/fundraising/applications/${appId}`,error.message);
  revalidatePath(`/admin/fundraising/applications/${appId}`); redirect(`/admin/fundraising/applications/${appId}?document_deleted=1`);
}
