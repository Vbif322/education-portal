// design-sync shim for `next/link` — renders a plain anchor so coupled-light
// components bundle and render outside a Next.js runtime. Navigation is inert in
// preview cards (by design).
import React, { AnchorHTMLAttributes, forwardRef, ReactNode } from "react";

type LinkProps = {
  href?: string | { pathname?: string } | any;
  children?: ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  locale?: string | false;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, children, prefetch, replace, scroll, shallow, passHref, locale, ...rest },
  ref,
) {
  const resolved =
    typeof href === "string" ? href : href?.pathname ?? "#";
  return (
    <a ref={ref} href={resolved} {...rest}>
      {children}
    </a>
  );
});

export default Link;
