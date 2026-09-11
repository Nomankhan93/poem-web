import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const checkedAt = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        status: "degraded",
        database: "not_configured",
        checkedAt,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("site_content_settings")
      .select("id")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        status: "ok",
        database: "ok",
        checkedAt,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "degraded",
        database: "unavailable",
        checkedAt,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
