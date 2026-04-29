-- Enable UUID generation
create extension if not exists "pgcrypto";

-- =========================
-- Resumes (private per user)
-- =========================
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Resume',
  data jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  public_slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resumes_user_id_idx on public.resumes(user_id);

-- =========================
-- Share tokens -> exported PDFs
-- =========================
create table if not exists public.resume_shares (
  id uuid primary key default gen_random_uuid(),
  share_token text unique not null,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  object_path text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists resume_shares_token_idx on public.resume_shares(share_token);

-- =========================
-- RLS policies
-- =========================
alter table public.resumes enable row level security;
alter table public.resume_shares enable row level security;

-- Owner can manage their resumes
create policy "resumes_select_own"
on public.resumes for select
using (user_id = auth.uid());

create policy "resumes_insert_own"
on public.resumes for insert
with check (user_id = auth.uid());

create policy "resumes_update_own"
on public.resumes for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Share token rows: owner can manage; public viewer access is handled by server-side lookup.
create policy "resume_shares_select_own"
on public.resume_shares for select
using (created_by = auth.uid());

create policy "resume_shares_insert_own"
on public.resume_shares for insert
with check (created_by = auth.uid());

create policy "resume_shares_update_own"
on public.resume_shares for update
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- Storage bucket for exported PDFs
-- Create bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('resume-exports', 'resume-exports', false)
on conflict (id) do nothing;

-- Allow authenticated users to upload PDFs only under:
-- exports/<userId>/...
create policy "resume_exports_upload_own_prefix"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'resume-exports'
  and (name like ('exports/' || auth.uid()::text || '/%'))
);

create policy "resume_exports_update_own_prefix"
on storage.objects for update
to authenticated
using (
  bucket_id = 'resume-exports'
  and (name like ('exports/' || auth.uid()::text || '/%'))
)
with check (
  bucket_id = 'resume-exports'
  and (name like ('exports/' || auth.uid()::text || '/%'))
);

