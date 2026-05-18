-- 1. Core Data Table Setup
CREATE TABLE public.listing_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  storage_path text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookups by listing
CREATE INDEX idx_listing_images_listing_id ON public.listing_images(listing_id);

-- Turn on Row Level Security for the table
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- Table Policy: Public can view images of published listings
CREATE POLICY "Public can view images of published listings"
  ON public.listing_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_images.listing_id
      AND l.status = 'published'::public.listing_status
    )
  );

-- Table Policy: Owners can view their own listing images
CREATE POLICY "Owners can view their own listing images"
  ON public.listing_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_images.listing_id
      AND l.owner_id = auth.uid()
    )
  );

-- Table Policy: Owners can insert, update, and delete their own listing images
CREATE POLICY "Owners can manage their own listing images"
  ON public.listing_images
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_images.listing_id
      AND l.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_images.listing_id
      AND l.owner_id = auth.uid()
    )
  );

-- Note: Admin access is natively supported via the SUPABASE_SERVICE_ROLE_KEY


-- 2. Storage Bucket Setup
-- Insert the public bucket configuration
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS on storage.objects is already enabled by Supabase.

-- Storage Policy: Anyone can view objects in the listing-images bucket
CREATE POLICY "Public can view listing images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'listing-images');

-- Storage Policy: Owners can upload images ONLY if the first folder in the path 
-- is their exact listing ID. (e.g. `123e4567-e89b-12d3-a456-426614174000/front.jpg`)
CREATE POLICY "Owners can upload images to their listings"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id::text = (string_to_array(name, '/'))[1]
      AND l.owner_id = auth.uid()
    )
  );

-- Storage Policy: Owners can update their own images
CREATE POLICY "Owners can update their listing images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id::text = (string_to_array(name, '/'))[1]
      AND l.owner_id = auth.uid()
    )
  );

-- Storage Policy: Owners can delete their own images
CREATE POLICY "Owners can delete their listing images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id::text = (string_to_array(name, '/'))[1]
      AND l.owner_id = auth.uid()
    )
  );
