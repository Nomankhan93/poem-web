import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  return applySecurityHeaders(
    response,
    request.nextUrl.pathname,
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
