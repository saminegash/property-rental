-- Create sale_terms table
CREATE TABLE public.sale_terms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE UNIQUE,
  sale_price bigint NOT NULL,
  is_negotiable boolean NOT NULL DEFAULT false,
  sale_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add indexes
CREATE INDEX idx_sale_terms_listing_id ON public.sale_terms(listing_id);

-- Enable RLS
ALTER TABLE public.sale_terms ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view sale_terms
CREATE POLICY "Public can view sale_terms"
  ON public.sale_terms
  FOR SELECT
  USING (true);

-- Policy: Owners can insert their own sale_terms
CREATE POLICY "Owners can insert their own sale_terms"
  ON public.sale_terms
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = auth.uid()
    )
  );

-- Policy: Owners can update their own sale_terms
CREATE POLICY "Owners can update their own sale_terms"
  ON public.sale_terms
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = auth.uid()
    )
  );

-- Trigger to automatically update updated_at
CREATE TRIGGER sale_terms_updated_at
  BEFORE UPDATE ON public.sale_terms
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

