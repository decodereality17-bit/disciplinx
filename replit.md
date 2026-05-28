# DisciplineX

A gamified discipline tracker for students — track tasks, goals, streaks, XP, and get AI-powered insights to stay locked in.

## Run & Operate

- `pnpm --filter @workspace/disciplinex run dev` — run the app (port 21045)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages

## Required Secrets

- `VITE_SUPABASE_URL` — your Supabase project URL (e.g. https://xxx.supabase.co)
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

Run `SUPABASE_SETUP.sql` in your Supabase SQL editor to create all tables + RLS policies.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack React Query + Supabase JS client
- Auth & DB: Supabase (Auth + PostgreSQL)
- Charts: Recharts
- Animations: Framer Motion
- UI: shadcn/ui + Tailwind v4
- Deployment: Vercel (SPA, vercel.json included)

## Where things live

- `artifacts/disciplinex/` — main frontend app
- `artifacts/disciplinex/src/lib/supabase.ts` — Supabase client
- `artifacts/disciplinex/src/lib/auth.tsx` — auth context
- `artifacts/disciplinex/src/lib/analytics.ts` — all analytics + insight functions
- `artifacts/disciplinex/src/hooks/` — React Query hooks for tasks, goals, profile
- `artifacts/disciplinex/src/pages/` — all pages
- `artifacts/disciplinex/src/components/` — reusable components
- `artifacts/disciplinex/src/index.css` — DisciplineX dark theme (Space Grotesk, oklch/hsl vars)
- `artifacts/disciplinex/SUPABASE_SETUP.sql` — DDL + RLS policies for Supabase
- `artifacts/disciplinex/vercel.json` — SPA rewrite rules for Vercel

## Architecture decisions

- Pure SPA with Supabase client — no Express backend needed; all data goes through Supabase JS.
- Always-dark theme — `document.documentElement.classList.add("dark")` at startup; no theme toggle.
- Discipline score = 50% today's completion + 30% 7-day avg + 20% streak bonus.
- XP = duration × 4 per completed task (variable feel from different task durations).
- Auth guard via wouter redirect — unauthenticated users land on /auth.

## Product

- **Dashboard**: greeting, animated discipline score ring, today's tasks, 7-day momentum chart, subject mix pie, goals overview, activity heatmap, weekly report, AI insights
- **Planner**: date-grouped task list, add/edit/delete tasks, link to goals, XP on completion, confetti celebration
- **Analytics**: 6 stat cards, 7-day area chart, 15-day bar chart, subject distribution, full heatmap
- **Goals**: set goals with task targets + deadlines, track per-goal completion from linked tasks
- **Insights**: AI-generated insights, psychological frameworks, daily motivational quote, score level
- **Profile**: avatar, score ring, 6 stats, 8 unlockable achievements, name edit, sign out

## User preferences

- Supabase for auth + database (not Replit PostgreSQL)
- Vercel deployment
- Psychologically engaging: loss aversion, identity-based language, streak framing, near-completion emphasis
- Port of github.com/decodereality17-bit/DisciplineX

## Gotchas

- `VITE_` prefix required for Supabase env vars (Vite only exposes VITE_* to the client)
- Run SUPABASE_SETUP.sql in Supabase dashboard before first login
- The `@workspace/api-client-react` devDep is inherited from scaffold but not used — safe to ignore
