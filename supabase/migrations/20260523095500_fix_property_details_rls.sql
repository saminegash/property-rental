-- 1. Drop the unsafe public SELECT policy
DROP POLICY IF EXISTS "Public can view property details" ON public.property_details;

-- 2. Add safe public SELECT policy (only published listings)
CREATE POLICY "Public can view property details of published listings"
  ON public.property_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = property_details.listing_id
      AND l.status = 'published'::public.listing_status
    )
  );

-- 3. Add owner SELECT policy (so owners can view their draft/pending property details)
CREATE POLICY "Owners can view their own property details"
  ON public.property_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = property_details.listing_id
      AND l.owner_id = auth.uid()
    )
  );

-- 4. Add owner DELETE policy (which was missing from the original migration)
CREATE POLICY "Owners can delete their own property details"
  ON public.property_details
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = property_details.listing_id
      AND l.owner_id = auth.uid()
    )
  );
