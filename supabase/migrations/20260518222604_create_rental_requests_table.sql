-- Create enum for rental request status
CREATE TYPE public.rental_request_status AS ENUM (
  'new_request',
  'admin_reviewing',
  'owner_contacted',
  'owner_available',
  'owner_unavailable',
  'renter_contacted',
  'awaiting_payment',
  'confirmed',
  'active',
  'completed',
  'cancelled',
  'rejected',
  'disputed'
);

-- Create rental_requests table
CREATE TABLE public.rental_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  renter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for public/guest requests
  renter_name text NOT NULL,
  renter_phone text NOT NULL,
  renter_email text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  needs_driver boolean NOT NULL DEFAULT false,
  needs_delivery boolean NOT NULL DEFAULT false,
  delivery_location text,
  message text,
  status public.rental_request_status NOT NULL DEFAULT 'new_request'::public.rental_request_status,
  admin_notes text,
  owner_response_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for frequent queries
CREATE INDEX idx_rental_requests_listing_id ON public.rental_requests(listing_id);
CREATE INDEX idx_rental_requests_renter_id ON public.rental_requests(renter_id);
CREATE INDEX idx_rental_requests_status ON public.rental_requests(status);

-- Enable Row Level Security
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (public or renter) can insert a new request
CREATE POLICY "Anyone can create a rental request"
  ON public.rental_requests
  FOR INSERT
  WITH CHECK (
    -- Only allow creating as 'new_request'
    status = 'new_request'::public.rental_request_status
  );

-- Policy: Renters can view their own requests
CREATE POLICY "Renters can view their own requests"
  ON public.rental_requests
  FOR SELECT
  USING (
    auth.uid() = renter_id
  );

-- Policy: Owners can view requests for their listings, BUT ONLY if admin has passed it to them
-- Admin review statuses are hidden from the owner to prevent direct contact before admin verification
CREATE POLICY "Owners can view requests assigned to them"
  ON public.rental_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = rental_requests.listing_id
      AND l.owner_id = auth.uid()
    )
    AND status NOT IN ('new_request', 'admin_reviewing')
  );

-- Policy: Owners can update their specific fields when a request is assigned to them
CREATE POLICY "Owners can respond to assigned requests"
  ON public.rental_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = rental_requests.listing_id
      AND l.owner_id = auth.uid()
    )
    AND status IN ('owner_contacted', 'owner_available', 'owner_unavailable')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = rental_requests.listing_id
      AND l.owner_id = auth.uid()
    )
  );

-- Note: Admin access (SELECT, UPDATE all fields) is natively supported 
-- via the SUPABASE_SERVICE_ROLE_KEY which bypasses RLS, as mandated by 
-- the constitution. No complex recursive policies needed.

-- Prevent non-admins from modifying admin_notes and restricted fields
CREATE OR REPLACE FUNCTION public.protect_rental_request_fields()
Returns trigger AS $$
BEGIN
  -- If the user is authenticated (not service role)
  IF current_user = 'authenticator' THEN
    -- Prevent modification of admin_notes
    IF new.admin_notes IS DISTINCT FROM old.admin_notes THEN
      new.admin_notes = old.admin_notes;
    END IF;
    
    -- Prevent renters from changing owner_response_notes
    IF auth.uid() = old.renter_id AND new.owner_response_notes IS DISTINCT FROM old.owner_response_notes THEN
      new.owner_response_notes = old.owner_response_notes;
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_rental_request_permissions
  BEFORE UPDATE ON public.rental_requests
  FOR EACH ROW EXECUTE PROCEDURE public.protect_rental_request_fields();

-- Trigger to automatically update updated_at
CREATE TRIGGER rental_requests_updated_at
  BEFORE UPDATE ON public.rental_requests
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
