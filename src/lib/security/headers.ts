import type { NextResponse } from "next/server";

function contentSecurityPolicy() {
  const production = process.env.NODE_ENV === "production";

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(production ? [] : ["'unsafe-eval'"]),
    "https://vercel.live",
    "https://*.vercel.live",
  ];

  const connectSrc = [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://vitals.vercel-insights.com",
    "https://*.vercel-insights.com",
    "https://vercel.live",
    "wss://*.vercel.live",
    ...(production
      ? []
      : [
          "http://localhost:*",
          "http://127.0.0.1:*",
          "ws://localhost:*",
          "ws://127.0.0.1:*",
        ]),
  ];

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "media-src 'self' blob: https://*.supabase.co https://*.supabase.in",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    ...(production ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function applySecurityHeaders(
  response: NextResponse,
  pathname: string,
) {
  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicy(),
  );
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Cross-Origin-Opener-Policy",
    "same-origin-allow-popups",
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/")
  ) {
    response.headers.set(
      "Cache-Control",
      "private, no-store, max-age=0",
    );
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive",
    );
  }

  return response;
}
