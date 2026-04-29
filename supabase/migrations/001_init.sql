create extension if not exists "pgcrypto";

create table if not exists public.businesses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  slug            text unique not null,

  -- Core
  name            text not null default '',
  tagline         text default '',
  description     text default '',
  category        text default 'business',

  -- Contact
  phone           text default '',
  email           text default '',
  address         text default '',
  website         text default '',

  -- Media (Unsplash URLs — no API key needed)
  hero_image      text default '',
  gallery         jsonb default '[]'::jsonb,   -- string[]

  -- Hours { "Monday": "9am–6pm", ... }
  hours           jsonb default '{}'::jsonb,

  -- Services [{ title, description, icon }]
  services        jsonb default '[]'::jsonb,

  -- Testimonials [{ author, role, text, rating }]
  testimonials    jsonb default '[]'::jsonb,

  -- Social { instagram, facebook, twitter, tiktok, whatsapp }
  social          jsonb default '{}'::jsonb,

  -- Theme
  theme_color     text default 'indigo',

  -- Stats (shown on hero)
  stat_years      text default '',
  stat_clients    text default '',
  stat_projects   text default '',

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.businesses enable row level security;

-- Owner full access
create policy "owner_all" on public.businesses
  for all using (auth.uid() = user_id);

-- Public can read any business (for /site/[slug])
create policy "public_read" on public.businesses
  for select using (true);

create index if not exists businesses_slug_idx    on public.businesses (slug);
create index if not exists businesses_user_idx    on public.businesses (user_id);
