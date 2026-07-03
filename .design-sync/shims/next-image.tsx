// design-sync shim for `next/image` — renders a plain <img>. Accepts the common
// next/image props and drops the ones with no meaning outside Next.js.
import React, { ImgHTMLAttributes } from "react";

type ImageProps = {
  src: string | { src: string } | any;
  alt?: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
  loader?: any;
  sizes?: string;
  unoptimized?: boolean;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height">;

export default function Image({
  src,
  alt = "",
  width,
  height,
  fill,
  priority,
  quality,
  placeholder,
  blurDataURL,
  loader,
  sizes,
  unoptimized,
  style,
  ...rest
}: ImageProps) {
  const resolved = typeof src === "string" ? src : src?.src ?? "";
  const fillStyle = fill
    ? { position: "absolute" as const, inset: 0, width: "100%", height: "100%", objectFit: "cover" as const }
    : undefined;
  return (
    <img
      src={resolved}
      alt={alt}
      width={fill ? undefined : (width as number | undefined)}
      height={fill ? undefined : (height as number | undefined)}
      style={{ ...fillStyle, ...style }}
      {...rest}
    />
  );
}
