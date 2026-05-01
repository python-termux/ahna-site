-- slug_setup.sql
-- Paste the entire file into Supabase → SQL Editor → New query → Run

-- Step 1: Reset any existing auto-generated slugs (with hyphens etc.)
-- so every user goes through the slug-picker screen to choose their own subdomain.
UPDATE businesses
SET slug = '_tmp_' || substr(md5(id::text), 1, 8)
WHERE slug NOT LIKE '_tmp_%';

-- Step 2: Add format check constraint (rows are clean after step 1)
ALTER TABLE businesses
ADD CONSTRAINT businesses_slug_format CHECK (
  slug ~ '^[a-z0-9]{4,30}$'
  OR
  slug ~ '^_tmp_[a-z0-9]{8,20}$'
);

-- Step 3: Index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses (slug);

-- Step 4: View to see which users still need to complete slug setup
CREATE OR REPLACE VIEW businesses_pending_slug AS
SELECT id, user_id, name, created_at
FROM businesses
WHERE slug LIKE '_tmp_%';
