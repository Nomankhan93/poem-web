"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function submitContactMessage(formData: FormData) {
  const name = value(formData, "name");
  const email = value(formData, "email");
  const phone = value(formData, "phone");
  const inquiryType = value(formData, "inquiryType") || "General inquiry";
  const message = value(formData, "message");

  if (name.length < 2 || !email.includes("@") || message.length < 10) {
    redirect(
      `/contact?error=${encodeURIComponent(
        "Please provide your name, a valid email and a message of at least 10 characters.",
      )}`,
    );
  }

  if (!isSupabaseConfigured()) {
    redirect(
      `/contact?error=${encodeURIComponent(
        "Contact submission is not connected yet. Configure local Supabase first.",
      )}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    phone,
    inquiry_type: inquiryType,
    message,
  });

  if (error) {
    redirect(`/contact?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/contact?sent=1");
}
