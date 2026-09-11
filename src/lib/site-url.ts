export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (vercelHost) {
    const withProtocol = vercelHost.startsWith("http")
      ? vercelHost
      : `https://${vercelHost}`;

    return withProtocol.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

export function absoluteUrl(pathname: string) {
  const base = getSiteUrl();
  const path = pathname.startsWith("/")
    ? pathname
    : `/${pathname}`;

  return `${base}${path}`;
}
