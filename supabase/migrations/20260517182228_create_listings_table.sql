-- Create enums for listing categorizations and status
CREATE TYPE public.listing_category AS ENUM ('vehicle', 'property');
CREATE TYPE public.listing_type AS ENUM ('rent', 'sale');
CREATE TYPE public.listing_status AS ENUM (
  'draft',
  'pending_review',
  'published',
  'rejected',
  'archived',
  'suspended'
);

-- Create the core listings table
CREATE TABLE public.listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category public.listing_category NOT NULL DEFAULT 'vehicle'::public.listing_category,
  listing_type public.listing_type NOT NULL DEFAULT 'rent'::public.listing_type,
  title text NOT NULL,
  description text,
  location text,
  status public.listing_status NOT NULL DEFAULT 'draft'::public.listing_status,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add indexes for common queries
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_owner_id ON public.listings(owner_id);
CREATE INDEX idx_listings_category ON public.listings(category);

-- Turn on Row Level Security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view published listings
CREATE POLICY "Public can view published listings"
  ON public.listings
  FOR SELECT
  USING (status = 'published'::public.listing_status);

-- Policy: Owners can view their own listings (including drafts, pending, etc.)
CREATE POLICY "Owners can view their own listings"
  ON public.listings
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Policy: Owners can insert their own listings
CREATE POLICY "Owners can insert their own listings"
  ON public.listings
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Owners can update their own listings
CREATE POLICY "Owners can update their own listings"
  ON public.listings
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Owners can delete their own listings
CREATE POLICY "Owners can delete their own listings"
  ON public.listings
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Note: Admin access (Manage all listings) is natively supported 
-- via the SUPABASE_SERVICE_ROLE_KEY which bypasses RLS, as per the constitution.

-- Trigger to automatically update updated_at
CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
