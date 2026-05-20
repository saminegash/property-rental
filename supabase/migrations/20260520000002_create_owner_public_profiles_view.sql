-- Migration: Create a public-safe view of owner verification status
-- This view exposes only non-sensitive columns from owner_profiles,
-- allowing the homepage and browse pages to show "Verified Owner" badges
-- without needing the service-role client.

-- The view uses security_invoker = false (i.e. security_definer),
-- which means it runs as the view owner and bypasses RLS on the
-- underlying owner_profiles table. The view itself acts as the
-- access control by only exposing safe columns.

CREATE OR REPLACE VIEW public.owner_public_profiles
WITH (security_invoker = false) AS
SELECT
  user_id,
  verification_status,
  owner_type,
  business_name
FROM public.owner_profiles;

COMMENT ON VIEW public.owner_public_profiles IS
  'Public-safe view of owner profiles. Excludes admin_notes and internal fields. Used for Verified Owner badges on listings.';

-- Grant read access to both anonymous and authenticated users
GRANT SELECT ON public.owner_public_profiles TO anon, authenticated;
