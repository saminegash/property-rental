-- 1. Drop the unsafe public SELECT policy on the bucket
DROP POLICY IF EXISTS "Public can view listing images" ON storage.objects;

-- 2. Add safe public SELECT policy (only images for published listings)
CREATE POLICY "Public can view listing images for published listings"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'listing-images' AND
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id::text = (string_to_array(name, '/'))[1]
      AND l.status = 'published'::public.listing_status
    )
  );

-- 3. Add owner SELECT policy (so owners can view their draft/pending images)
CREATE POLICY "Owners can view their own listing images"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'listing-images' AND
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id::text = (string_to_array(name, '/'))[1]
      AND l.owner_id = auth.uid()
    )
  );
