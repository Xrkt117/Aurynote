# UI setup

The desktop app already uses React and TypeScript. Tailwind v4 and the shadcn directory conventions are now configured; no new project is needed.

## Paths

- App root: `desktop/`
- Reusable UI: `desktop/src/components/ui/`
- Calendar: `desktop/src/components/ui/git-hub-calendar.tsx`
- Example: `desktop/src/components/demos/demo.tsx`
- App integration: `desktop/src/PracticeActivity.tsx`
- Existing app styles: `desktop/src/style.css`
- Tailwind theme and utilities: `desktop/src/tailwind.css`
- Shared class helper: `desktop/src/lib/utils.ts`
- shadcn configuration: `desktop/components.json`

The `@` alias points to `desktop/src` in both TypeScript and Vite. Thus `@/components/ui` is this app's equivalent of `/components/ui`; a second repository-root components directory would sit outside the app's source tree. Keeping reusable UI here makes imports predictable and gives the shadcn CLI a consistent installation target. Existing primitives in `src/components.tsx` are retained.

## Install and run

Use Node 22.12 or newer:

```sh
cd desktop
npm ci
npm start
```

Installed dependencies include date-fns, clsx, tailwind-merge, class-variance-authority, tailwindcss, and @tailwindcss/vite. Lucide was already installed. No providers or external images are required for this calendar.

The existing project was configured manually to preserve its stylesheet. When adding another shadcn component, run from `desktop`:

```sh
npx shadcn@latest add button
```

For a separate, unconfigured Vite React/TypeScript project, install Tailwind and its Vite plugin, register `tailwindcss()` beside `react()` in vite.config.ts, configure the `@/*` path alias in TypeScript and Vite, and run:

```sh
npm install tailwindcss @tailwindcss/vite
npx shadcn@latest init
```

Do not reinitialize this configured app as part of routine component additions. Its Tailwind entry imports theme and utilities without Preflight so existing controls retain their styles. New components should set any required reset-like styles locally and use the configured theme tokens.

References: [Tailwind with Vite](https://tailwindcss.com/docs/installation/using-vite), [Preflight configuration](https://tailwindcss.com/docs/preflight), [shadcn components.json](https://ui.shadcn.com/docs/components-json).

## Calendar contract

```tsx
import { GitHubCalendar } from '@/components/ui/git-hub-calendar';

<GitHubCalendar
  data={[{ date: '2026-09-30', count: 3 }]}
  colors={['#edf0e7', '#cbd8b7', '#a1b782', '#738f50', '#405c31']}
  activityLabel="practice answers"
/>
```

Dates remain `YYYY-MM-DD` strings. Optional `today` fixes the displayed range for demos/tests. The supplied component's string/Date type mismatch, approximate month arithmetic, repeated linear searches, and timezone-shifting date parsing were corrected. The demo uses a fixed date and sample data; the app uses only saved practice answers. Activity is based on the latest 2,000 retained answers, not a GitHub connection.
