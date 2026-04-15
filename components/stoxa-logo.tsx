import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

type StoxaMarkProps = {
  className?: string;
  title?: string;
};

/** Isotipo: caja / niveles de stock + forma de S. */
export function StoxaMark({ className, title }: StoxaMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("shrink-0", className)}
    >
      {title ? <title>{title}</title> : null}
      <rect
        x="3"
        y="3"
        width="26"
        height="26"
        rx="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="opacity-90"
      />
      <path
        fill="currentColor"
        fillOpacity={0.88}
        d="M10 9.5h12a1.25 1.25 0 0 1 0 2.5H11.5c-.69 0-1.25.56-1.25 1.25v.5c0 .69.56 1.25 1.25 1.25h9a3.25 3.25 0 0 1 0 6.5H10a1.25 1.25 0 0 1 0-2.5h10.5c.69 0 1.25-.56 1.25-1.25v-.5c0-.69-.56-1.25-1.25-1.25h-9a3.25 3.25 0 0 1 0-6.5Z"
      />
    </svg>
  );
}

type StoxaWordmarkProps = {
  className?: string;
  /** Texto secundario bajo el nombre (por defecto tagline de marca). */
  subtitle?: string | null;
  /** Tamaño visual del bloque de texto. */
  size?: "sm" | "md";
  /** Colores alineados con superficie (p. ej. barra lateral). */
  tone?: "default" | "sidebar";
};

export function StoxaWordmark({
  className,
  subtitle = APP_TAGLINE,
  size = "md",
  tone = "default",
}: StoxaWordmarkProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p
        className={cn(
          "font-heading font-semibold tracking-tight",
          tone === "sidebar" ? "text-sidebar-foreground" : "text-foreground",
          size === "sm" ? "text-base leading-tight" : "text-lg leading-tight",
        )}
      >
        {APP_NAME}
      </p>
      {subtitle ? (
        <p
          className={cn(
            "truncate font-sans font-medium tracking-wide text-muted-foreground uppercase",
            size === "sm" ? "text-[10px]" : "text-[11px]",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

type StoxaBrandLockupProps = {
  className?: string;
  href?: string;
  /** Clases del isotipo (tamaño, color). */
  markClassName?: string;
  subtitle?: string | null;
  size?: "sm" | "md";
  tone?: "default" | "sidebar";
};

/** Logo + wordmark para cabeceras y enlaces a inicio. */
export function StoxaBrandLockup({
  className,
  href = "/",
  markClassName,
  subtitle,
  size = "md",
  tone = "default",
}: StoxaBrandLockupProps) {
  const markSize = size === "sm" ? "size-8" : "size-9";
  const inner = (
    <>
      <StoxaMark className={cn(markSize, "text-primary", markClassName)} title={APP_NAME} />
      <StoxaWordmark subtitle={subtitle} size={size} tone={tone} />
    </>
  );

  const wrapClass = cn(
    "flex min-w-0 items-center gap-2.5 rounded-lg outline-none ring-sidebar-ring focus-visible:ring-2",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={wrapClass}>
        {inner}
      </Link>
    );
  }

  return <div className={wrapClass}>{inner}</div>;
}
