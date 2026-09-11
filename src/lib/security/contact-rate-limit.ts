import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

function sha256(value: string) {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

async function requestFingerprint() {
  const requestHeaders = await headers();

  const forwardedFor = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  const realIp = requestHeaders
    .get("x-real-ip")
    ?.trim();

  const ip = forwardedFor || realIp || "unknown";

  return sha256(`poem-contact-ip:${ip}`);
}

export async function allowContactSubmission(
  email: string,
) {
  const supabase = await createClient();
  const ipHash = await requestFingerprint();
  const emailHash = sha256(
    `poem-contact-email:${email.trim().toLowerCase()}`,
  );

  const { data, error } = await supabase.rpc(
    "check_contact_rate_limit",
    {
      p_ip_hash: ipHash,
      p_email_hash: emailHash,
    },
  );

  if (error) {
    console.error(
      "Contact rate-limit check failed:",
      error.message,
    );

    // Fail closed if anti-abuse infrastructure is unavailable.
    return false;
  }

  return data === true;
}
