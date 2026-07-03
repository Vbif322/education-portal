# design-sync NOTES — education-portal

This repo is a **Next.js application**, not a component-library. The design system is
extracted in **synth-entry mode** (no `dist/`): a hand-authored named-export barrel
(`.design-sync/entry.tsx`) re-exports each component, bundled by esbuild.

## Build / re-sync commands

```sh
# staged scripts + deps (fresh clone — .ds-sync/ is gitignored)
mkdir -p .ds-sync && cp -r "<skill>/package-*.mjs" "<skill>/resync.mjs" "<skill>/lib" "<skill>/storybook" .ds-sync/
echo '{"name":"ds-sync-deps","private":true}' > .ds-sync/package.json
(cd .ds-sync && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i esbuild ts-morph @types/react playwright)

# build + validate (system Chrome, no chromium download)
node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --entry ./.design-sync/entry.tsx --out ./ds-bundle
DS_CHROMIUM_PATH=/usr/bin/google-chrome node .ds-sync/package-validate.mjs ./ds-bundle
```

## Gotchas (learned during the first sync)

- **All components are `export default`.** The converter discovers *named* PascalCase exports,
  so `.design-sync/entry.tsx` re-exports each as a named export and is passed via `--entry`.
  `componentSrcMap` pins every component's source path for ts-morph.
- **`tsconfig.sync.json` must NOT contain an `include` glob with `**/*`.** The converter's
  `tsconfigPathsPlugin` strips `/* … */` comments before `JSON.parse`; a `**/*` produces a `*/`
  that pairs with the `/*` inside the `"@/*"` paths key and silently deletes the `paths` block
  (plugin returns null → no aliases → bundle fails). Keep that file to `compilerOptions` only.
- **Synth-entry `.d.ts` extraction returns empty props** (`[key: string]: unknown`) for default
  exports, so **every component has a hand-written `cfg.dtsPropsFor` body** (self-contained, inline
  object shapes, no `@/@types` imports — those don't resolve in the emitted `.d.ts`). If a
  component's real props change in source, update its `dtsPropsFor` by hand — it is NOT auto-derived.
- **Next.js coupling is shimmed**, not removed: `.design-sync/shims/{next-link,next-image,next-script,next-navigation,node-path}` +
  `tsconfig.sync.json` `paths`. Routing is a no-op in previews (expected). `node-path` shim exists
  because `src/app/utils/helpers.ts` shares a module (`formatTime`) with a server-only `getVideoPath`
  that imports node `path`.
- **Render check uses system Chrome** via `DS_CHROMIUM_PATH=/usr/bin/google-chrome` (Google Chrome 150).
  `playwright` lib installed into `.ds-sync/` with browser download skipped — no ~150 MB chromium.
- **Fonts:** the app loads Geist via `next/font` (JS), which the bundle does not reference, so previews
  render in the system fallback (Arial), not Geist. No `[FONT_MISSING]` — expected, not a defect.
- **Excluded (5):** `Header`, `SignupForm`, `CourseForm` (import server actions), `Player` (internal
  `/api` fetches), `YandexMetrika` (analytics injector, not a UI component).

## Per-component override notes

- Overlays render open in a single card: `Dialog`, `ContactDialog`, `DeleteDialog`, `AddSkillModal`,
  `VideoModal` → `cardMode: single` (+ viewport).
- Wide/full-bleed → `cardMode: column`: all 4 tables, `Navbar`, `Aside`.
- **`Aside` needs `viewport: 1280x800`** — its CSS `@media (max-width:1024px){ display:none }` blanks it
  at the default 900px. Its preview wraps the aside in a 320×620 frame (aside uses `height:100%`, needs
  a definite parent height). Bottom-most lesson can be slightly clipped by the 620px frame — cosmetic.
- **`UsersTable` needs `viewport: 1100x700`** — 6 columns clip the last ("Перейти") at 900px.
- **`VideoModal`** has no default trigger styling (styled only via consumer `buttonClassName`); its
  preview supplies a DS-token-styled `.vm-cta` class via an inline `<style>`.
- **`LessonMaterials`** real `Material` type has a `type` field (pdf/presentation/image/archive/other)
  driving the file icon, beyond `{id,name,url}`.
- `UsersTable` subscription `endedAt` dates are set far-past (2018/19) and far-future (2099) so the
  Статус column reliably shows both Истекла/Активна regardless of the capture host clock.

## Known render warns
- Before previews were authored, the 5 primitives (`Button`, `Chip`, `Divider`, `IconButton`,
  `Progress`) tripped `[RENDER_BLANK]` on their auto floor cards (tiny renders). All are now authored;
  no blank warns should remain. A `[RENDER_BLANK]` on any of these post-authoring is a real regression.
- **`[RENDER_THIN] IconButton`** — benign. IconButton is an icon-only 40×40 button (no text); the
  check flags "no text / paints nothing" but the lucide icon renders fine (verified on the sheet).
- **`[RENDER_THIN] AddSkillModal`** — benign. It is a portal/fixed-position modal, so the mount's
  measured height is 0px, but the modal content (input + actions) renders fine (verified on the sheet).

## Re-sync risks (watch-list)
- `dtsPropsFor` is hand-maintained — drifts silently if component props change in source. Re-check a
  component's `.d.ts` against its source after any prop change.
- Override viewports are tied to component CSS breakpoints (Aside 1024px). If the source CSS changes,
  the viewport override may need updating.
- `VideoModal`'s preview CTA styling is preview-only (not from the DS). If the DS ever ships a real
  trigger style, drop the inline `<style>`.
- Shims are bundle/preview-only. If components adopt new `next/*` APIs, extend `tsconfig.sync.json`
  `paths` + add a shim.
- `.ds-sync/` (scripts + deps incl. playwright) is gitignored — reinstall per the commands above on a
  fresh clone. Built with Node 24.
- `LessonTable` imports `@/app/(lk)/dashboard/admin/lesson-change-modal`; it bundled cleanly this run
  (no server-only leak), but that import is a latent risk if the admin modal gains server code.
