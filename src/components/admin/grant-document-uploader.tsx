"use client";
import { FileUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { documentTypes } from "@/lib/fundraising";

const safe=(n:string)=>n.toLowerCase().replace(/[^a-z0-9._-]+/g,"-").replace(/-+/g,"-");
export function GrantDocumentUploader({applicationId}:{applicationId:string}){
  const [documentType,setDocumentType]=useState("proposal"); const [title,setTitle]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  async function upload(file:File){ setBusy(true); setError(""); try{
    if(file.size>25*1024*1024) throw new Error("Grant document must be 25 MB or smaller."); const supabase=createClient();
    const storagePath=`applications/${applicationId}/${crypto.randomUUID()}-${safe(file.name)}`;
    const {error:up}=await supabase.storage.from("grant-documents").upload(storagePath,file,{upsert:false,cacheControl:"3600",contentType:file.type}); if(up) throw up;
    const {error:meta}=await supabase.from("grant_application_documents").insert({application_id:applicationId,document_type:documentType,title:title.trim()||file.name,storage_path:storagePath,file_name:file.name,mime_type:file.type,size_bytes:file.size});
    if(meta){ await supabase.storage.from("grant-documents").remove([storagePath]); throw meta; } window.location.reload();
  }catch(e){ setError(e instanceof Error?e.message:"Upload failed."); } finally{ setBusy(false); }}
  return <div className="rounded-[22px] border border-dashed border-black/15 bg-poem-soft p-5">
    <div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold text-poem-900">Document type<select value={documentType} onChange={e=>setDocumentType(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm">{documentTypes.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
    <label className="text-sm font-bold text-poem-900">Document title<input value={title} onChange={e=>setTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm" placeholder="Optional display title"/></label></div>
    <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-xs font-extrabold text-white">{busy?<Loader2 size={15} className="animate-spin"/>:<FileUp size={15}/>} {busy?"Uploading...":"Upload private document"}<input type="file" className="sr-only" disabled={busy} accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={e=>{const f=e.target.files?.[0]; if(f) void upload(f); e.currentTarget.value="";}}/></label>
    <p className="mt-3 text-xs text-poem-muted">Private grant workspace only. Maximum 25 MB per file.</p>{error?<p className="mt-3 text-xs font-bold text-red-700">{error}</p>:null}
  </div>;
}
