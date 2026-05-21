-- Create pending_price_changes table
CREATE TABLE public.pending_price_changes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_type public.listing_type NOT NULL,
  proposed_terms jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_feedback text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookups
CREATE INDEX idx_pending_price_changes_listing_id ON public.pending_price_changes(listing_id);
CREATE INDEX idx_pending_price_changes_status ON public.pending_price_changes(status);

-- Enable RLS
ALTER TABLE public.pending_price_changes ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view their own pending price changes
CREATE POLICY "Owners can view their own pending price changes"
  ON public.pending_price_changes
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Policy: Owners can insert their own pending price changes
CREATE POLICY "Owners can insert pending price changes"
  ON public.pending_price_changes
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Owners can update their own pending price changes
CREATE POLICY "Owners can update pending price changes"
  ON public.pending_price_changes
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Trigger to automatically update updated_at
CREATE TRIGGER pending_price_changes_updated_at
  BEFORE UPDATE ON public.pending_price_changes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

