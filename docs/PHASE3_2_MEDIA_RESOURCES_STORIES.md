# POEM Phase 3.2 — Media, Resources & Success Stories

## Scope

This patch intentionally implements the stable Phase 3.2 scope:

- Supabase Storage
- Media Library
- Project cover images and galleries
- Image captions and alt text
- Resources/PDF CMS
- Public resource pages and downloads
- Success Stories CMS
- Story cover images and galleries
- Public story pages
- Project → reports and featured story links
- Storage RLS

Team, Partners, News, Careers and Tenders CMS remain for Phase 3.3.

## Storage buckets

- `project-media`
  - public images
  - 10 MB per file
  - JPEG / PNG / WebP / GIF
- `documents`
  - public PDF documents
  - 25 MB per file

Public visitors can read files. Only authenticated POEM content managers (`admin` / `editor`) can upload, update or delete files.

## Database additions

- `media_assets`
- `resources`
- `stories`
- `project_media`
- `story_media`

Projects gain:

- `donor_partner`
- `featured_story_id`

## Admin routes

- `/admin/media`
- `/admin/resources`
- `/admin/resources/new`
- `/admin/resources/[id]`
- `/admin/stories`
- `/admin/stories/new`
- `/admin/stories/[id]`

Existing project edit pages now support:

- donor/partner
- featured story
- cover image
- gallery
- linked resources/reports

## Public routes

- `/resources`
- `/resources/[slug]`
- `/stories`
- `/stories/[slug]`

Existing `/projects/[slug]` now displays project media, reports and featured story.

## Local migration

```bash
cd /home/noman/projects/poem-web
npx supabase db reset
```

If you do not want a local reset:

```bash
npx supabase migration up
```

## Cloud Supabase

After linking the correct cloud project:

```bash
npx supabase db push
```

Review the migration before pushing.

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Then test uploads with an `admin` or `editor` account.

## Production note

The Storage buckets are public because POEM website documents and public project photography need direct public URLs. Do not upload confidential beneficiary records, identity documents, consent forms or other private files to these public buckets.
