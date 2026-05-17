-- Create the rental_terms table
CREATE TABLE public.rental_terms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- 1:1 relationship with listings
  listing_id uuid NOT NULL UNIQUE REFERENCES public.listings(id) ON DELETE CASCADE,
  
  -- Availability Flags
  available_with_driver boolean NOT NULL DEFAULT false,
  available_without_driver boolean NOT NULL DEFAULT true,
  
  -- Core Rental Pricing (stored independently from commission)
  daily_price integer,
  weekly_price integer,
  monthly_price integer,
  
  -- Ancillary Fees (Strictly separated per Constitution)
  daily_driver_fee integer,
  weekly_driver_fee integer,
  monthly_driver_fee integer,
  security_deposit_amount integer NOT NULL DEFAULT 0,
  
  -- Logistics & Terms
  minimum_rental_days integer NOT NULL DEFAULT 1,
  pickup_available boolean NOT NULL DEFAULT true,
  delivery_available boolean NOT NULL DEFAULT false,
  delivery_fee integer,
  estimated_delivery_time text,
  
  -- Free-form text for special conditions
  rental_notes text,
  
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookups by listing
CREATE INDEX idx_rental_terms_listing_id ON public.rental_terms(listing_id);

-- Turn on Row Level Security
ALTER TABLE public.rental_terms ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view rental terms if the parent listing is published
CREATE POLICY "Public can view rental terms of published listings"
  ON public.rental_terms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = rental_terms.listing_id
      AND l.status = 'published'::public.listing_status
    )
  );

-- Policy: Owners can view their own rental terms (even if draft/pending)
CREATE POLICY "Owners can view their own rental terms"
  ON public.rental_terms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = rental_terms.listing_id
      AND l.owner_id = auth.uid()
    )
  );

-- Policy: Owners can insert rental terms for their own listings
CREATE POLICY "Owners can insert rental terms"
  ON public.rental_terms
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
      AND l.owner_id = auth.uid()
    )
  );

-- Policy: Owners can update rental terms for their own listings
CREATE POLICY "Owners can update rental terms"
  ON public.rental_terms
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = rental_terms.listing_id
      AND l.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
      AND l.owner_id = auth.uid()
    )
  );

-- Policy: Owners can delete rental terms for their own listings
CREATE POLICY "Owners can delete rental terms"
  ON public.rental_terms
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = rental_terms.listing_id
      AND l.owner_id = auth.uid()
    )
  );

-- Trigger to automatically update updated_at
CREATE TRIGGER rental_terms_updated_at
  BEFORE UPDATE ON public.rental_terms
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
