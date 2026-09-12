"use client";

import { useRouter } from "next/navigation";
import {
  FileUp,
  Loader2,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";
import {
  agreementTypes,
  reportDocumentKinds,
} from "@/lib/grants";
import { createClient } from "@/lib/supabase/client";

const input =
  "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-poem-700";
const label = "text-sm font-bold text-poem-900";

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
}

function nullableText(formData: FormData, key: string) {
  const result = String(formData.get(key) ?? "").trim();
  return result || null;
}

function optionalMoney(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Agreement amount must be zero or greater.");
  }

  return parsed;
}

async function uploadFile(
  file: File,
  prefix: string,
) {
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("File must be 25 MB or smaller.");
  }

  const supabase = createClient();
  const storagePath = `${prefix}/${crypto.randomUUID()}-${safeFileName(file.name)}`;

  const { error } = await supabase.storage
    .from("grant-documents")
    .upload(storagePath, file, {
      upsert: false,
      cacheControl: "3600",
      contentType: file.type || "application/octet-stream",
    });

  if (error) throw error;

  return {
    storagePath,
    fileName: file.name,
    mimeType: file.type || "",
    sizeBytes: file.size,
  };
}

export function GrantAgreementUploader({
  grantId,
  currency,
}: {
  grantId: string;
  currency: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");
    let uploaded: Awaited<ReturnType<typeof uploadFile>> | null = null;

    try {
      const title = String(formData.get("title") ?? "").trim();
      if (!title) throw new Error("Agreement title is required.");

      if (file instanceof File && file.size > 0) {
        uploaded = await uploadFile(
          file,
          `awards/${grantId}/agreements`,
        );
      }

      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your admin session has expired. Please sign in again.");
      }

      const { error: insertError } = await supabase
        .from("grant_agreements")
        .insert({
          grant_id: grantId,
          agreement_type:
            String(formData.get("agreement_type") ?? "original") ||
            "original",
          title,
          reference_number: String(
            formData.get("reference_number") ?? "",
          ).trim(),
          signed_date: nullableText(formData, "signed_date"),
          effective_date: nullableText(formData, "effective_date"),
          expiry_date: nullableText(formData, "expiry_date"),
          agreement_amount: optionalMoney(
            formData,
            "agreement_amount",
          ),
          currency,
          storage_path: uploaded?.storagePath ?? null,
          file_name: uploaded?.fileName ?? null,
          mime_type: uploaded?.mimeType ?? "",
          size_bytes: uploaded?.sizeBytes ?? 0,
          notes: String(formData.get("notes") ?? "").trim(),
          uploaded_by: user.id,
        });

      if (insertError) {
        throw insertError;
      }

      router.push(
        `/admin/fundraising/grants/${grantId}?agreement=1`,
      );
      router.refresh();
    } catch (failure) {
      if (uploaded) {
        await createClient().storage
          .from("grant-documents")
          .remove([uploaded.storagePath]);
      }

      setError(
        failure instanceof Error
          ? failure.message
          : "Agreement could not be saved.",
      );
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-[20px] bg-poem-soft p-5 md:grid-cols-2"
    >
      <label className={label}>
        Agreement type
        <select name="agreement_type" className={input}>
          {agreementTypes.map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
      </label>

      <label className={label}>
        Title *
        <input name="title" required className={input} />
      </label>

      <label className={label}>
        Reference number
        <input name="reference_number" className={input} />
      </label>

      <label className={label}>
        Agreement amount
        <input
          name="agreement_amount"
          type="number"
          min="0"
          step="0.01"
          className={input}
        />
      </label>

      <label className={label}>
        Signed date
        <input name="signed_date" type="date" className={input} />
      </label>

      <label className={label}>
        Effective date
        <input
          name="effective_date"
          type="date"
          className={input}
        />
      </label>

      <label className={label}>
        Expiry date
        <input name="expiry_date" type="date" className={input} />
      </label>

      <label className={label}>
        Private agreement file
        <input
          name="file"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          className={input}
        />
      </label>

      <label className={`${label} md:col-span-2`}>
        Notes
        <textarea name="notes" rows={3} className={input} />
      </label>

      {error ? (
        <p className="md:col-span-2 text-xs font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-poem-950 px-5 py-3 text-xs font-extrabold text-white disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <FileUp size={15} />
          )}
          {busy ? "Saving..." : "Add agreement"}
        </button>
      </div>
    </form>
  );
}

export function GrantReportDocumentUploader({
  grantId,
  obligationId,
}: {
  grantId: string;
  obligationId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setError("Choose a report document to upload.");
      setBusy(false);
      return;
    }

    let uploaded: Awaited<ReturnType<typeof uploadFile>> | null = null;

    try {
      uploaded = await uploadFile(
        file,
        `awards/${grantId}/reports/${obligationId}`,
      );

      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your admin session has expired. Please sign in again.");
      }

      const { error: insertError } = await supabase
        .from("grant_report_documents")
        .insert({
          obligation_id: obligationId,
          document_kind:
            String(formData.get("document_kind") ?? "other") ||
            "other",
          title:
            String(formData.get("title") ?? "").trim() || file.name,
          storage_path: uploaded.storagePath,
          file_name: uploaded.fileName,
          mime_type: uploaded.mimeType,
          size_bytes: uploaded.sizeBytes,
          uploaded_by: user.id,
        });

      if (insertError) {
        throw insertError;
      }

      router.push(
        `/admin/fundraising/grants/${grantId}/reporting?report_document=1`,
      );
      router.refresh();
    } catch (failure) {
      if (uploaded) {
        await createClient().storage
          .from("grant-documents")
          .remove([uploaded.storagePath]);
      }

      setError(
        failure instanceof Error
          ? failure.message
          : "Report document upload failed.",
      );
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 grid gap-3 rounded-xl border border-dashed border-black/15 p-4 sm:grid-cols-2"
    >
      <label className={label}>
        Document kind
        <select name="document_kind" className={input}>
          {reportDocumentKinds.map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
      </label>

      <label className={label}>
        Title
        <input name="title" className={input} />
      </label>

      <label className={`${label} sm:col-span-2`}>
        File *
        <input
          name="file"
          type="file"
          required
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          className={input}
        />
      </label>

      {error ? (
        <p className="sm:col-span-2 text-xs font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-poem-950 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <FileUp size={14} />
          )}
          {busy ? "Uploading..." : "Upload report document"}
        </button>
      </div>
    </form>
  );
}
