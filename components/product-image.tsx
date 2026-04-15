"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Package } from "lucide-react";

type Props = {
  pathOrUrl: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

function Placeholder({
  className,
  width,
  height,
}: {
  className?: string;
  width: number;
  height: number;
}) {
  return (
    <div
      className={
        className ??
        "flex size-16 items-center justify-center rounded-lg border bg-muted"
      }
      style={{ width, height }}
    >
      <Package className="size-8 text-muted-foreground" aria-hidden />
    </div>
  );
}

function SignedStorageImage({
  path,
  alt,
  className,
  width,
  height,
}: {
  path: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.storage
      .from("product-images")
      .createSignedUrl(path, 3600)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          setFailed(true);
          return;
        }
        setSrc(data.signedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (failed || !src) {
    return <Placeholder className={className} width={width} height={height} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className ?? "rounded-lg object-cover"}
      unoptimized
    />
  );
}

/** Si `pathOrUrl` es ruta de Storage (sin http), pide URL firmada. */
export function ProductImage({
  pathOrUrl,
  alt,
  className,
  width = 64,
  height = 64,
}: Props) {
  if (!pathOrUrl) {
    return <Placeholder className={className} width={width} height={height} />;
  }

  if (pathOrUrl.startsWith("http")) {
    return (
      <Image
        src={pathOrUrl}
        alt={alt}
        width={width}
        height={height}
        className={className ?? "rounded-lg object-cover"}
        unoptimized
      />
    );
  }

  return (
    <SignedStorageImage
      path={pathOrUrl}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  );
}
