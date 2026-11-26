-- Schéma PostgreSQL / Supabase complet pour le portfolio de Cherif Balde
-- Exécuter ce script dans l'éditeur SQL de votre projet Supabase

create extension if not exists "pgcrypto";

create table if not exists public.portfolio_state (
  id text primary key default 'main',
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  read boolean not null default false,
  email_delivered boolean not null default false,
  created_at timestamptz not null default now()
);

-- Sécurité Row Level Security (RLS)
alter table public.portfolio_state enable row level security;
alter table public.contact_messages enable row level security;

-- Lecture publique du portfolio
create policy "Lecture publique du portfolio"
  on public.portfolio_state for select
  using (true);

-- Modification réservée à l'administrateur authentifié
create policy "Modification admin du portfolio"
  on public.portfolio_state for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Insertion publique des messages de contact
create policy "Envoi public de message"
  on public.contact_messages for insert
  with check (true);

-- Lecture et gestion des messages réservées à l'administrateur
create policy "Gestion admin des messages"
  on public.contact_messages for all
  using (auth.role() = 'authenticated');

-- Bucket Supabase Storage pour les photographies et certificats PDF
insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

create policy "Lecture publique media"
  on storage.objects for select
  using (bucket_id = 'portfolio-media');

create policy "Upload admin media"
  on storage.objects for insert
  with check (bucket_id = 'portfolio-media' and auth.role() = 'authenticated');

create policy "Suppression admin media"
  on storage.objects for delete
  using (bucket_id = 'portfolio-media' and auth.role() = 'authenticated');
