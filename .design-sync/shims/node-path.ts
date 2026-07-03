// design-sync shim for node's `path` builtin. Only reached because a
// browser-safe helper (formatTime) shares a module with a server-only one
// (getVideoPath). getVideoPath never runs in a preview, so a minimal stub that
// satisfies bundling is enough.
function basename(p: string, ext?: string): string {
  let base = String(p).split(/[\\/]/).pop() ?? "";
  if (ext && base.endsWith(ext)) base = base.slice(0, -ext.length);
  return base;
}

function join(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .join("/")
    .replace(/\/{2,}/g, "/");
}

function dirname(p: string): string {
  const s = String(p).replace(/[\\/]+$/, "");
  const i = s.search(/[\\/][^\\/]*$/);
  return i < 0 ? "." : s.slice(0, i) || "/";
}

function extname(p: string): string {
  const base = basename(p);
  const i = base.lastIndexOf(".");
  return i > 0 ? base.slice(i) : "";
}

const path = { basename, join, dirname, extname, sep: "/" };

export { basename, join, dirname, extname };
export default path;
