-- 1. Drop the unsafe public SELECT policy
DROP POLICY IF EXISTS "Public can view sale_terms" ON public.sale_terms;

-- 2. Add safe public SELECT policy (only published listings)
CREATE POLICY "Public can view sale_terms of published listings"
  ON public.sale_terms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = sale_terms.listing_id
      AND l.status = 'published'::public.listing_status
    )
  );

-- 3. Add owner SELECT policy (so owners can view their draft/pending sale_terms)
CREATE POLICY "Owners can view their own sale_terms"
  ON public.sale_terms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = sale_terms.listing_id
      AND l.owner_id = auth.uid()
    )
  );

-- 4. Add owner DELETE policy (which was missing from the original migration)
CREATE POLICY "Owners can delete their own sale_terms"
  ON public.sale_terms
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = sale_terms.listing_id
      AND l.owner_id = auth.uid()
    )
  );
