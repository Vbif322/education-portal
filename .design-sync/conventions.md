# Education Portal UI — conventions

A small React design system extracted from a Next.js education-portal app. Russian-language
product (courses, lessons, modules, students). Components are the real compiled parts —
compose them with realistic props; do not reimplement them.

## Setup — no provider needed

There is **no theme/context provider**. Theming is pure CSS custom properties. Just ensure the
bundle's `styles.css` is loaded (it `@import`s the component styles `_ds_bundle.css` and the
token definitions). Then render any component directly:

```jsx
import { CourseCard, Button } from "<this design system>";

<CourseCard
  name="Основы веб-разработки"
  description="От HTML до React за 8 недель"
  moduleCount={5}
  lessonCount={42}
  progress={{ completed: 12, total: 42, percentage: 29 }}
/>
<Button>Записаться на курс</Button>
<Button variant="text">Подробнее</Button>
<Button color="error">Удалить</Button>
```

## Styling idiom — props + CSS variables (NOT utility classes)

This system has **no Tailwind, no utility-class vocabulary, and no `className`-driven design
language**. Style two ways only:

1. **Component props** carry the design intent. Examples: `Button` `variant?: 'text' | 'filled'`
   and `color?: 'error'`; `Chip` `backgroundColor`; `Progress` `value` / `color` /
   `backgroundColor`; `FeatureCard` `color` (accent). Read each component's `<Name>.d.ts` for its
   props before using it.
2. **CSS custom properties** define the theme, set on `:root`. Reference them with `var(--*)` in
   any layout glue you add:

   | Token | Meaning |
   |---|---|
   | `--background` / `--foreground` | page bg / text color |
   | `--link-color` / `--link-color-hover` / `--link-color-active` | link + primary-action blue |
   | `--aside-width` | course-sidebar width (320px) |
   | `--header-height` | app header height (58px) |

   There is also a `.link` global class for inline links (uses `--link-color`).

Components style themselves via bundled CSS modules — you do not pass class names to theme them.
Fonts fall back to the system stack (the app serves Geist at runtime via `next/font`; it is not
part of this bundle, so previews and standalone renders use the system font).

## Where the truth lives

- `styles.css` (+ its `@import` of `_ds_bundle.css`) — all component + token styles.
- `<Name>.d.ts` — the exact props for each component (hand-verified).
- `<Name>.prompt.md` — per-component usage.

## Composition notes

- Overlays (`Dialog`, `ContactDialog`, `DeleteDialog`, `AddSkillModal`, `VideoModal`) are controlled:
  pass `open`/`isOpen` and the close/confirm callbacks.
- Cards and forms take domain data as props (`CourseCard`, `LessonCard`, `LessonForm`, the tables) —
  give them realistic course/lesson/module/user objects; see each `.d.ts` for the shape.
- `VideoModal`'s trigger button is unstyled unless you pass a `buttonClassName`.
