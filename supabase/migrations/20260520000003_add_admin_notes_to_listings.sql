-- Migration: Add admin_notes column to listings table
-- Internal notes for admin use during listing review. Not visible to owners.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS admin_notes text;

COMMENT ON COLUMN public.listings.admin_notes IS
  'Internal admin notes for listing review. NOT visible to owners (distinct from admin_rejection_reason which IS visible).';
