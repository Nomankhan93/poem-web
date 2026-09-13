import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  "supabase/migrations/20260912080000_poem_public_fundraising_campaigns.sql",
  "utf8",
);
const publicLib = readFileSync("src/lib/fundraising-campaigns.ts", "utf8");
const actions = readFileSync("src/app/admin/fundraising-public-actions.ts", "utf8");
const sitemap = readFileSync("src/app/sitemap.ts", "utf8");

assert.match(migration, /create table if not exists public\.project_funding_profiles/);
assert.match(migration, /create table if not exists public\.fundraising_campaigns/);
assert.match(migration, /create table if not exists public\.fundraising_donations/);
assert.match(migration, /status = 'verified'/);
assert.match(migration, /get_public_fundraising_campaigns/);
assert.match(migration, /get_public_project_funding_by_slug/);
assert.match(migration, /can_manage_fundraising/);
assert.doesNotMatch(migration, /grant select on public\.fundraising_campaigns to anon/);
assert.doesNotMatch(migration, /public read fundraising donations/);
assert.match(publicLib, /createPublicClient/);
assert.match(actions, /requireSiteAdmin/);
assert.match(sitemap, /get_public_fundraising_campaigns/);
assert.doesNotMatch(sitemap, /from\("fundraising_campaigns"\)/);

console.log("Phase 4.0C fundraising source checks passed.");
