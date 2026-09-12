import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const migration = read(
  "supabase/migrations/20260912060000_poem_phase4_integrity_stabilization.sql",
);
const contact = read("src/app/contact/actions.ts");
const limiter = read("src/lib/security/contact-rate-limit.ts");
const grants = read("src/app/admin/grant-management-actions.ts");
const publicContent = read("src/lib/public-content.ts");

assert.match(
  migration,
  /revoke insert on public\.contact_messages from anon, authenticated/i,
);
assert.match(
  migration,
  /revoke all\s+on function public\.sync_grant_installment_status\(uuid\)/i,
);
assert.match(migration, /create_grant_award_atomic/i);
assert.match(migration, /validate_grant_fund_receipt/i);
assert.match(migration, /period_start date/i);
assert.match(migration, /period_end date/i);

assert.match(contact, /createSupabaseAdminClient/);
assert.doesNotMatch(contact, /createClient\(\)/);
assert.match(limiter, /createHmac/);
assert.match(grants, /create_grant_award_atomic/);
assert.match(grants, /\.gte\("period_start", periodStart\)/);
assert.match(grants, /\.lte\("period_end", periodEnd\)/);

assert.doesNotMatch(publicContent, /staticProjects/);
assert.match(publicContent, /createPublicClient/);

console.log("Phase 4.0B stabilization source checks passed.");
