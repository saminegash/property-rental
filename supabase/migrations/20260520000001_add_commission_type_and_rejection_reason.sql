-- Migration: Add tiered commission fields and listing rejection reason
-- These columns support the corrected tiered commission model and admin feedback.

-- 1. Add commission_type to commissions table to track tier applied
ALTER TABLE public.commissions
  ADD COLUMN IF NOT EXISTS commission_type text NOT NULL DEFAULT 'flat_fee'
    CHECK (commission_type IN ('flat_fee', 'percentage')),
  ADD COLUMN IF NOT EXISTS rental_days integer;

-- 2. Add admin_rejection_reason to listings so owners can see why a listing was rejected
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS admin_rejection_reason text;

COMMENT ON COLUMN public.commissions.commission_type IS
  'flat_fee = short-term (1-30 days, 300/600/1000 Birr based on daily price); percentage = long-term (31+ days, 8% of base)';

COMMENT ON COLUMN public.commissions.rental_days IS
  'Cached rental duration in days at time of commission calculation.';

COMMENT ON COLUMN public.listings.admin_rejection_reason IS
  'Admin-written reason for rejecting a listing. Visible to the owner.';
