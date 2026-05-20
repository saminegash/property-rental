-- Create enums for property-specific statuses and conditions
CREATE TYPE public.property_condition AS ENUM (
  'newly_built',
  'excellent',
  'good',
  'fair',
  'needs_repair'
);

CREATE TYPE public.furnished_status AS ENUM (
  'unfurnished',
  'semi_furnished',
  'fully_furnished'
);

-- Create property_types table
CREATE TABLE public.property_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insert seed data for property_types
INSERT INTO public.property_types (name) VALUES 
  ('Apartment'),
  ('Villa'),
  ('Condominium'),
  ('Studio'),
  ('Office'),
  ('Commercial'),
  ('Warehouse'),
  ('Land'),
  ('Guest House');

-- Create property_details table
CREATE TABLE public.property_details (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE UNIQUE,
  property_type_id uuid NOT NULL REFERENCES public.property_types(id),
  bedrooms integer,
  bathrooms integer,
  area_sqm integer,
  floor integer,
  total_floors integer,
  furnished_status public.furnished_status,
  parking_available boolean NOT NULL DEFAULT false,
  compound_available boolean NOT NULL DEFAULT false,
  water_available boolean NOT NULL DEFAULT false,
  electricity_available boolean NOT NULL DEFAULT false,
  internet_available boolean NOT NULL DEFAULT false,
  property_condition public.property_condition,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add indexes for property_details
CREATE INDEX idx_property_details_listing_id ON public.property_details(listing_id);
CREATE INDEX idx_property_details_property_type_id ON public.property_details(property_type_id);

-- Enable RLS for property_types
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view property_types
CREATE POLICY "Public can view property types"
  ON public.property_types
  FOR SELECT
  USING (true);

-- Enable RLS for property_details
ALTER TABLE public.property_details ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view property_details
CREATE POLICY "Public can view property details"
  ON public.property_details
  FOR SELECT
  USING (true);

-- Policy: Owners can insert their own property_details
CREATE POLICY "Owners can insert their own property details"
  ON public.property_details
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = auth.uid()
    )
  );

-- Policy: Owners can update their own property_details
CREATE POLICY "Owners can update their own property details"
  ON public.property_details
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
CREATE TRIGGER property_details_updated_at
  BEFORE UPDATE ON public.property_details
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
