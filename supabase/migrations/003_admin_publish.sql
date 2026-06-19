-- 003_admin_publish.sql
-- Adds publish / expiry control for sites, managed from the admin panel.
-- Paste the entire file into Supabase → SQL Editor → New query → Run.

-- Step 1: Add publishing columns
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS published       boolean      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_until  timestamptz;

-- Step 2: Keep every already-live site live (real slug = already chosen subdomain).
-- These get NO expiry date (published_until = NULL → live forever) so nothing breaks.
-- New sites keep the default published = false until an admin publishes them.
UPDATE public.businesses
SET published = true, published_until = NULL
WHERE slug NOT LIKE '_tmp_%';

-- Step 3: Index for quick filtering by publish state
CREATE INDEX IF NOT EXISTS businesses_published_idx ON public.businesses (published);
