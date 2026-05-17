-- Create enums for standardized vehicle attributes
CREATE TYPE public.transmission_type AS ENUM ('automatic', 'manual', 'semi_automatic', 'cvt');
CREATE TYPE public.fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'phev');
CREATE TYPE public.vehicle_condition AS ENUM ('new', 'excellent', 'good', 'fair', 'needs_repair');

-- Create the vehicle_details table
CREATE TABLE public.vehicle_details (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- 1:1 relationship with listings
  listing_id uuid NOT NULL UNIQUE REFERENCES public.listings(id) ON DELETE CASCADE,
  -- Foreign key to the taxonomy table
  vehicle_type_id uuid NOT NULL REFERENCES public.vehicle_types(id) ON DELETE RESTRICT,
  
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  transmission public.transmission_type NOT NULL,
  fuel_type public.fuel_type NOT NULL,
  seats integer,
  mileage integer, -- stored in km
  color text,
  condition public.vehicle_condition NOT NULL,
  
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookups by listing
CREATE INDEX idx_vehicle_details_listing_id ON public.vehicle_details(listing_id);

-- Turn on Row Level Security
ALTER TABLE public.vehicle_details ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view vehicle details if the parent listing is published
CREATE POLICY "Public can view vehicle details of published listings"
  ON public.vehicle_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = vehicle_details.listing_id
      AND l.status = 'published'::public.listing_status
    )
  );

-- Policy: Owners can view their own vehicle details (even if draft/pending)
CREATE POLICY "Owners can view their own vehicle details"
  ON public.vehicle_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = vehicle_details.listing_id
      AND l.owner_id = auth.uid()
    )
  );

-- Policy: Owners can insert vehicle details for their own listings
CREATE POLICY "Owners can insert vehicle details"
  ON public.vehicle_details
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
      AND l.owner_id = auth.uid()
    )
  );

-- Policy: Owners can update vehicle details for their own listings
CREATE POLICY "Owners can update vehicle details"
  ON public.vehicle_details
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = vehicle_details.listing_id
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

-- Policy: Owners can delete vehicle details for their own listings
CREATE POLICY "Owners can delete vehicle details"
  ON public.vehicle_details
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = vehicle_details.listing_id
      AND l.owner_id = auth.uid()
    )
  );

-- Trigger to automatically update updated_at
CREATE TRIGGER vehicle_details_updated_at
  BEFORE UPDATE ON public.vehicle_details
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
