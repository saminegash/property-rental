-- Create the vehicle_types table
-- Designed generically (id, name, slug) to serve as a template
-- for future taxonomies like property_types, aligning with the generic listing architecture.
CREATE TABLE public.vehicle_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Turn on Row Level Security
ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active vehicle types (needed for public listing filters/forms)
CREATE POLICY "Anyone can view active vehicle types"
  ON public.vehicle_types
  FOR SELECT
  USING (is_active = true);

-- Note: Admin mutations (insert/update/delete) are handled natively via the 
-- service-role key to bypass RLS, keeping client security tight.

-- Trigger to automatically update updated_at
CREATE TRIGGER vehicle_types_updated_at
  BEFORE UPDATE ON public.vehicle_types
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Seed initial data
INSERT INTO public.vehicle_types (name, slug, sort_order) VALUES
  ('Sedan', 'sedan', 10),
  ('SUV', 'suv', 20),
  ('Hatchback', 'hatchback', 30),
  ('Pickup', 'pickup', 40),
  ('Van', 'van', 50),
  ('Minibus', 'minibus', 60),
  ('Luxury', 'luxury', 70),
  ('Economy', 'economy', 80),
  ('Electric', 'electric', 90),
  ('Hybrid', 'hybrid', 100);
