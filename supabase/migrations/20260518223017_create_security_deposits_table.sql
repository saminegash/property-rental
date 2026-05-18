-- Create enum for security deposit status
CREATE TYPE public.security_deposit_status AS ENUM (
  'not_required',
  'pending',
  'collected',
  'refunded',
  'partially_refunded',
  'withheld'
);

-- Create security_deposits table
CREATE TABLE public.security_deposits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_request_id uuid NOT NULL UNIQUE REFERENCES public.rental_requests(id) ON DELETE CASCADE,
  deposit_amount integer NOT NULL DEFAULT 0,
  deposit_status public.security_deposit_status NOT NULL DEFAULT 'pending'::public.security_deposit_status,
  payment_method text,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for frequent queries
CREATE INDEX idx_security_deposits_rental_request_id ON public.security_deposits(rental_request_id);
CREATE INDEX idx_security_deposits_status ON public.security_deposits(deposit_status);

-- Enable Row Level Security
ALTER TABLE public.security_deposits ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view security deposits for their own listings
CREATE POLICY "Owners can view security deposits for their listings"
  ON public.security_deposits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rental_requests rr
      JOIN public.listings l ON rr.listing_id = l.id
      WHERE rr.id = security_deposits.rental_request_id
      AND l.owner_id = auth.uid()
    )
  );

-- Policy: Renters can view security deposits for their own requests
CREATE POLICY "Renters can view their own security deposits"
  ON public.security_deposits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rental_requests rr
      WHERE rr.id = security_deposits.rental_request_id
      AND rr.renter_id = auth.uid()
    )
  );

-- Note: Admin access (SELECT, INSERT, UPDATE, DELETE) is natively supported 
-- via the SUPABASE_SERVICE_ROLE_KEY which bypasses RLS, as mandated by 
-- the constitution. Admins calculate and manage the deposit status manually for MVP.

-- Trigger to automatically update updated_at
CREATE TRIGGER security_deposits_updated_at
  BEFORE UPDATE ON public.security_deposits
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
