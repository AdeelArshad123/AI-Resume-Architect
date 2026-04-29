# AI Storytelling Resume Builder (2026)

Tech stack: Next.js 15 (App Router), TypeScript, Tailwind, Framer Motion, Zustand, Supabase, Gemini/OpenAI.

## Local setup

1. Copy env:
   - `cp .env.example .env.local`
2. Create a Supabase project and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Apply Supabase migrations:
   - `supabase/migrations/0001_init.sql`
4. Create a Storage bucket:
   - bucket id: `resume-exports`
   - bucket should be private (RLS/policies handled by migration)

## Run

`npm run dev`

