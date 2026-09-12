import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminSecret,
} from "@/lib/supabase/admin";

function getFingerprintSecret() {
  const secret =
    process.env.CONTACT_RATE_LIMIT_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error(
      "Contact anti-abuse secret is not configured.",
    );
  }

  return secret;
}

function hmac(value: string) {
  return createHmac("sha256", getFingerprintSecret())
    .update(value)
    .digest("hex");
}

async function requestFingerprint() {
  const requestHeaders = await headers();

  const forwardedFor = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  const realIp = requestHeaders.get("x-real-ip")?.trim();
  const ip = forwardedFor || realIp || "unknown";

  return hmac(`poem-contact-ip:${ip}`);
}

export async function allowContactSubmission(email: string) {
  if (!hasSupabaseAdminSecret()) {
    console.error(
      "Contact rate limiting requires a server-only Supabase secret.",
    );
    return false;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const ipHash = await requestFingerprint();
    const emailHash = hmac(
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
      return false;
    }

    return data === true;
  } catch (error) {
    console.error("Contact rate-limit check failed:", error);
    return false;
  }
}
