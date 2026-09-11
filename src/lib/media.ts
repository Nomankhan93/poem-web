export type MediaAsset = {
  id: string;
  bucket: string;
  path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  alt_text: string;
  caption: string;
};

export function formatBytes(bytes: number) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function sanitizeFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const extension = dot >= 0 ? name.slice(dot).toLowerCase() : "";
  const base = dot >= 0 ? name.slice(0, dot) : name;

  const cleanBase =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "file";

  return `${cleanBase}${extension}`;
}
