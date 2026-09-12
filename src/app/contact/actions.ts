"use server";

import { redirect } from "next/navigation";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminSecret,
} from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { allowContactSubmission } from "@/lib/security/contact-rate-limit";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function publicError(message: string): never {
  redirect(`/contact?error=${encodeURIComponent(message)}`);
}

export async function submitContactMessage(formData: FormData) {
  const name = value(formData, "name");
  const email = value(formData, "email").toLowerCase();
  const phone = value(formData, "phone");
  const inquiryType =
    value(formData, "inquiryType") || "General inquiry";
  const message = value(formData, "message");

  const website = value(formData, "website");
  if (website) {
    redirect("/contact?sent=1");
  }

  const startedAt = Number(value(formData, "formStartedAt"));

  if (
    !Number.isFinite(startedAt) ||
    Date.now() - startedAt < 1200
  ) {
    redirect("/contact?sent=1");
  }

  if (
    name.length < 2 ||
    name.length > 120 ||
    !email.includes("@") ||
    email.length > 254 ||
    phone.length > 40 ||
    inquiryType.length > 80 ||
    message.length < 10 ||
    message.length > 5000
  ) {
    publicError("Please check the form fields and try again.");
  }

  if (!isSupabaseConfigured() || !hasSupabaseAdminSecret()) {
    publicError(
      "The contact form is temporarily unavailable. Please try again later.",
    );
  }

  const allowed = await allowContactSubmission(email);

  if (!allowed) {
    publicError(
      "Too many recent submissions were received. Please wait before trying again.",
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    phone,
    inquiry_type: inquiryType,
    message,
  });

  if (error) {
    console.error("Contact message insert failed:", error.message);
    publicError(
      "Your message could not be submitted right now. Please try again later.",
    );
  }

  redirect("/contact?sent=1");
}
