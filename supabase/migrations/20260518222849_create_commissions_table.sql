-- Create enum for commission status
CREATE TYPE public.commission_status AS ENUM (
  'pending',
  'collected',
  'waived',
  'refunded'
);

-- Create commissions table
CREATE TABLE public.commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_request_id uuid NOT NULL UNIQUE REFERENCES public.rental_requests(id) ON DELETE CASCADE,
  commission_rate numeric(5,2) NOT NULL DEFAULT 5.00,
  commission_base_amount integer NOT NULL, -- Calculated from rental price only (excludes fees/deposits)
  commission_amount integer NOT NULL,
  commission_status public.commission_status NOT NULL DEFAULT 'pending'::public.commission_status,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for frequent queries
CREATE INDEX idx_commissions_rental_request_id ON public.commissions(rental_request_id);
CREATE INDEX idx_commissions_status ON public.commissions(commission_status);

-- Enable Row Level Security
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view commissions for their own listings
-- (Renters do not see commissions as this is a platform-to-owner relationship)
CREATE POLICY "Owners can view commissions for their listings"
  ON public.commissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rental_requests rr
      JOIN public.listings l ON rr.listing_id = l.id
      WHERE rr.id = commissions.rental_request_id
      AND l.owner_id = auth.uid()
    )
  );

-- Note: Admin access (SELECT, INSERT, UPDATE, DELETE) is natively supported 
-- via the SUPABASE_SERVICE_ROLE_KEY which bypasses RLS, as mandated by 
-- the constitution. Admins calculate and manage the commission status.

-- Trigger to automatically update updated_at
CREATE TRIGGER commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
