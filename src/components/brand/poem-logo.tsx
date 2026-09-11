import Image from "next/image";
import Link from "next/link";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type PoemLogoProps = {
  href?: string;
  variant?: "horizontal" | "emblem";
  size?: "sm" | "md" | "lg";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  label?: string;
};

const sizes = {
  horizontal: {
    sm: { width: 168, height: 63 },
    md: { width: 220, height: 83 },
    lg: { width: 300, height: 113 },
  },
  emblem: {
    sm: { width: 42, height: 42 },
    md: { width: 56, height: 56 },
    lg: { width: 72, height: 72 },
  },
} as const;

function LogoImage({
  variant = "horizontal",
  size = "md",
  imageClassName,
  priority = false,
}: Omit<PoemLogoProps, "href" | "className" | "label">) {
  const src =
    variant === "horizontal"
      ? "/brand/poem-logo-horizontal.jpg"
      : "/brand/poem-logo-emblem.jpg";

  const alt =
    variant === "horizontal"
      ? "POEM logo"
      : "POEM emblem";

  const dimension = sizes[variant][size];

  return (
    <Image
      src={src}
      alt={alt}
      width={dimension.width}
      height={dimension.height}
      priority={priority}
      className={cn("h-auto w-auto", imageClassName)}
    />
  );
}

export function PoemLogo({
  href = "/",
  variant = "horizontal",
  size = "md",
  className,
  imageClassName,
  priority = false,
  label,
}: PoemLogoProps) {
  const content = (
    <span className={cn("inline-flex items-center", className)}>
      <LogoImage
        variant={variant}
        size={size}
        imageClassName={imageClassName}
        priority={priority}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      aria-label={label ?? "POEM home"}
      className="inline-flex items-center"
    >
      {content}
    </Link>
  );
}
