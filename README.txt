POEM Logo Branding Patch

Target project:
  /home/noman/projects/poem-web

What it does:
  - adds official POEM logo assets to public/brand/
  - replaces placeholder branding in public header/footer
  - updates admin shell branding
  - refreshes admin login screen branding

Extract:
  cd /home/noman/projects
  rm -rf /home/noman/projects/poem-logo-branding-patch
  unzip -o /mnt/c/Users/noman/Downloads/poem-logo-branding-patch.zip -d /home/noman/projects

Dry-run:
  python3 /home/noman/projects/poem-logo-branding-patch/apply_patch.py --project /home/noman/projects/poem-web --check

Apply:
  python3 /home/noman/projects/poem-logo-branding-patch/apply_patch.py --project /home/noman/projects/poem-web

After apply:
  cd /home/noman/projects/poem-web
  npx tsc --noEmit
  npm run lint
  npm run build
