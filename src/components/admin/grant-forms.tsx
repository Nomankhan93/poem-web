import Link from "next/link";
import {
  addFundReceipt,
  addGrantAgreement,
  addGrantInstallment,
  addGrantReportDocument,
  addReportingObligation,
  saveGrantAward,
  updateReportingObligation,
} from "@/app/admin/grant-management-actions";
import { agreementTypes, grantStatuses, reportDocumentKinds, reportStatuses, reportTypes } from "@/lib/grants";

const input = "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-poem-700";
const label = "text-sm font-bold text-poem-900";
type Option = { id: string; label: string };
type Row = Record<string, unknown>;

export function GrantAwardForm({ award, applications, donors, projects, programs }: { award?: Row; applications: Option[]; donors: Option[]; projects: Option[]; programs: Option[] }) {
  return (
    <form action={saveGrantAward} className="space-y-6">
      {award?.id ? <input type="hidden" name="id" value={String(award.id)} /> : null}
      <section className="rounded-[24px] border border-black/[0.06] bg-white p-6">
        <h2 className="font-extrabold text-poem-950">Grant award</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className={`${label} md:col-span-2`}>Grant title *<input name="title" required defaultValue={String(award?.title ?? "")} className={input} /></label>
          <label className={label}>Source application<select name="application_id" defaultValue={String(award?.application_id ?? "")} className={input}><option value="">Direct award / no application</option>{applications.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
          <label className={label}>Donor<select name="donor_id" defaultValue={String(award?.donor_id ?? "")} className={input}><option value="">No donor selected</option>{donors.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
          <label className={label}>Related project<select name="project_id" defaultValue={String(award?.project_id ?? "")} className={input}><option value="">No project selected</option>{projects.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
          <label className={label}>Related program<select name="program_id" defaultValue={String(award?.program_id ?? "")} className={input}><option value="">No program selected</option>{programs.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
          <label className={label}>Award / agreement number<input name="award_number" defaultValue={String(award?.award_number ?? "")} className={input} /></label>
          <label className={label}>Status<select name="status" defaultValue={String(award?.status ?? "awarded")} className={input}>{grantStatuses.map(([v,t]) => <option key={v} value={v}>{t}</option>)}</select></label>
          <label className={label}>Award amount *<input name="award_amount" type="number" min="0" step="0.01" required defaultValue={String(award?.award_amount ?? "")} className={input} /></label>
          <label className={label}>Currency<input name="currency" maxLength={3} defaultValue={String(award?.currency ?? "USD")} className={input} /></label>
          <label className={label}>Award date<input name="award_date" type="date" defaultValue={String(award?.award_date ?? "")} className={input} /></label>
          <label className={label}>Grant manager<input name="grant_manager" defaultValue={String(award?.grant_manager ?? "")} className={input} /></label>
          <label className={label}>Start date<input name="start_date" type="date" defaultValue={String(award?.start_date ?? "")} className={input} /></label>
          <label className={label}>End date<input name="end_date" type="date" defaultValue={String(award?.end_date ?? "")} className={input} /></label>
        </div>
        <label className={`${label} mt-5 block`}>Internal notes<textarea name="notes" rows={5} defaultValue={String(award?.notes ?? "")} className={input} /></label>
      </section>
      <div className="flex justify-end gap-3"><Link href="/admin/fundraising/grants" className="rounded-full border border-black/10 px-6 py-3 text-sm font-extrabold text-poem-900">Cancel</Link><button className="rounded-full bg-poem-950 px-7 py-3 text-sm font-extrabold text-white">{award?.id ? "Save grant" : "Create grant award"}</button></div>
    </form>
  );
}

export function AgreementForm({ grantId, currency }: { grantId: string; currency: string }) {
  return <form action={addGrantAgreement} className="grid gap-4 rounded-[20px] bg-poem-soft p-5 md:grid-cols-2" encType="multipart/form-data"><input type="hidden" name="grant_id" value={grantId}/><label className={label}>Agreement type<select name="agreement_type" className={input}>{agreementTypes.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label><label className={label}>Title *<input name="title" required className={input}/></label><label className={label}>Reference number<input name="reference_number" className={input}/></label><label className={label}>Agreement amount<input name="agreement_amount" type="number" min="0" step="0.01" className={input}/><input type="hidden" name="currency" value={currency}/></label><label className={label}>Signed date<input name="signed_date" type="date" className={input}/></label><label className={label}>Effective date<input name="effective_date" type="date" className={input}/></label><label className={label}>Expiry date<input name="expiry_date" type="date" className={input}/></label><label className={label}>Private agreement file<input name="file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" className={input}/></label><label className={`${label} md:col-span-2`}>Notes<textarea name="notes" rows={3} className={input}/></label><div className="md:col-span-2"><button className="rounded-full bg-poem-950 px-5 py-3 text-xs font-extrabold text-white">Add agreement</button></div></form>;
}

export function InstallmentForm({ grantId, nextNumber }: { grantId: string; nextNumber: number }) {
  return <form action={addGrantInstallment} className="grid gap-4 rounded-[20px] bg-poem-soft p-5 md:grid-cols-2"><input type="hidden" name="grant_id" value={grantId}/><label className={label}>Installment number<input name="installment_number" type="number" min="1" required defaultValue={nextNumber} className={input}/></label><label className={label}>Label<input name="label" placeholder="First tranche" className={input}/></label><label className={label}>Expected amount *<input name="expected_amount" type="number" min="0" step="0.01" required className={input}/></label><label className={label}>Expected date<input name="expected_date" type="date" className={input}/></label><label className={`${label} md:col-span-2`}>Notes<textarea name="notes" rows={3} className={input}/></label><div className="md:col-span-2"><button className="rounded-full bg-poem-950 px-5 py-3 text-xs font-extrabold text-white">Add installment</button></div></form>;
}

export function ReceiptForm({ grantId, installments }: { grantId: string; installments: Option[] }) {
  return <form action={addFundReceipt} className="grid gap-4 rounded-[20px] bg-poem-soft p-5 md:grid-cols-2"><input type="hidden" name="grant_id" value={grantId}/><label className={label}>Installment<select name="installment_id" className={input}><option value="">General / unallocated receipt</option>{installments.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label><label className={label}>Amount received *<input name="amount" type="number" min="0.01" step="0.01" required className={input}/></label><label className={label}>Received date<input name="received_date" type="date" className={input}/></label><label className={label}>Reference number<input name="reference_number" className={input}/></label><label className={label}>Bank reference<input name="bank_reference" className={input}/></label><label className={label}>Notes<input name="notes" className={input}/></label><div className="md:col-span-2"><button className="rounded-full bg-poem-950 px-5 py-3 text-xs font-extrabold text-white">Record funds received</button></div></form>;
}

export function ReportingObligationForm({ grantId }: { grantId: string }) {
  return <form action={addReportingObligation} className="grid gap-4 rounded-[20px] bg-poem-soft p-5 md:grid-cols-2"><input type="hidden" name="grant_id" value={grantId}/><label className={label}>Report type<select name="report_type" className={input}>{reportTypes.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label><label className={label}>Report title *<input name="title" required className={input}/></label><label className={label}>Period start<input name="period_start" type="date" className={input}/></label><label className={label}>Period end<input name="period_end" type="date" className={input}/></label><label className={label}>Due date<input name="due_date" type="date" className={input}/></label><label className={label}>Responsible person<input name="responsible_person" className={input}/></label><label className={`${label} md:col-span-2`}>Notes<textarea name="notes" rows={3} className={input}/></label><div className="md:col-span-2"><button className="rounded-full bg-poem-950 px-5 py-3 text-xs font-extrabold text-white">Add reporting obligation</button></div></form>;
}

export function ReportingStatusForm({ grantId, obligationId, status, feedback }: { grantId: string; obligationId: string; status: string; feedback: string }) {
  return <form action={updateReportingObligation} className="grid gap-3 sm:grid-cols-[180px_1fr_auto]"><input type="hidden" name="grant_id" value={grantId}/><input type="hidden" name="obligation_id" value={obligationId}/><select name="status" defaultValue={status} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-bold">{reportStatuses.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select><input name="donor_feedback" defaultValue={feedback} placeholder="Donor feedback / revision note" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs"/><button className="rounded-full border border-black/10 px-4 py-2 text-xs font-extrabold text-poem-900">Update</button></form>;
}

export function ReportDocumentForm({ grantId, obligationId }: { grantId: string; obligationId: string }) {
  return <form action={addGrantReportDocument} className="mt-4 grid gap-3 rounded-xl border border-dashed border-black/15 p-4 sm:grid-cols-2" encType="multipart/form-data"><input type="hidden" name="grant_id" value={grantId}/><input type="hidden" name="obligation_id" value={obligationId}/><label className={label}>Document kind<select name="document_kind" className={input}>{reportDocumentKinds.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label><label className={label}>Title<input name="title" className={input}/></label><label className={`${label} sm:col-span-2`}>File *<input name="file" type="file" required accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" className={input}/></label><div className="sm:col-span-2"><button className="rounded-full bg-poem-950 px-4 py-2 text-xs font-extrabold text-white">Upload report document</button></div></form>;
}
