// design-sync shim for `next/navigation` — inert router/hooks so coupled-light
// components render in preview cards. All navigation is a no-op by design.

const noop = () => {};

export function useRouter() {
  return {
    push: noop,
    replace: noop,
    back: noop,
    forward: noop,
    refresh: noop,
    prefetch: noop,
  };
}

export function useParams<T = Record<string, string | string[]>>(): T {
  return {} as T;
}

export function usePathname(): string {
  return "/";
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams();
}

export function useSelectedLayoutSegment(): string | null {
  return null;
}

export function useSelectedLayoutSegments(): string[] {
  return [];
}

export function redirect(_url: string): never {
  throw new Error("next/navigation redirect() called in a design-sync preview");
}

export function permanentRedirect(_url: string): never {
  throw new Error("next/navigation permanentRedirect() called in a design-sync preview");
}

export function notFound(): never {
  throw new Error("next/navigation notFound() called in a design-sync preview");
}

export const ReadonlyURLSearchParams = URLSearchParams;
