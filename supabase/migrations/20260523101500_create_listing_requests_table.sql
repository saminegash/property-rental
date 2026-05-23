-- Create enum for listing request type
CREATE TYPE public.listing_request_type AS ENUM (
  'rent',
  'buy',
  'sale_inquiry',
  'general'
);

-- Create enum for listing request status (mirroring rental_requests for admin consistency)
CREATE TYPE public.listing_request_status AS ENUM (
  'new_request',
  'admin_reviewing',
  'owner_contacted',
  'owner_available',
  'owner_unavailable',
  'requester_contacted',
  'confirmed',
  'completed',
  'cancelled',
  'rejected',
  'disputed'
);

-- Create listing_requests table
CREATE TABLE public.listing_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  requester_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for public/guest requests
  requester_name text NOT NULL,
  requester_phone text NOT NULL,
  requester_email text,
  request_type public.listing_request_type NOT NULL,
  message text,
  preferred_contact_method text,
  preferred_viewing_date date,
  budget_amount numeric,
  status public.listing_request_status NOT NULL DEFAULT 'new_request'::public.listing_request_status,
  admin_notes text,
  owner_response_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for frequent queries
CREATE INDEX idx_listing_requests_listing_id ON public.listing_requests(listing_id);
CREATE INDEX idx_listing_requests_requester_id ON public.listing_requests(requester_id);
CREATE INDEX idx_listing_requests_status ON public.listing_requests(status);
CREATE INDEX idx_listing_requests_type ON public.listing_requests(request_type);

-- Enable Row Level Security
ALTER TABLE public.listing_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (public or logged-in) can insert a new request
CREATE POLICY "Anyone can create a listing request"
  ON public.listing_requests
  FOR INSERT
  WITH CHECK (
    -- Only allow creating as 'new_request'
    status = 'new_request'::public.listing_request_status
  );

-- Policy: Requesters can view their own requests
CREATE POLICY "Requesters can view their own requests"
  ON public.listing_requests
  FOR SELECT
  USING (
    auth.uid() = requester_id
  );

-- Policy: Owners can view requests for their listings, BUT ONLY if admin has passed it to them
CREATE POLICY "Owners can view requests assigned to them"
  ON public.listing_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_requests.listing_id
      AND l.owner_id = auth.uid()
    )
    AND status NOT IN ('new_request', 'admin_reviewing')
  );

-- Policy: Owners can update their specific fields when a request is assigned to them
CREATE POLICY "Owners can respond to assigned requests"
  ON public.listing_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_requests.listing_id
      AND l.owner_id = auth.uid()
    )
    AND status IN ('owner_contacted', 'owner_available', 'owner_unavailable')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_requests.listing_id
      AND l.owner_id = auth.uid()
    )
  );

-- Prevent non-admins from modifying admin_notes and restricted fields
CREATE OR REPLACE FUNCTION public.protect_listing_request_fields()
Returns trigger AS $$
BEGIN
  -- If the user is authenticated (not service role)
  IF current_user = 'authenticator' THEN
    -- Prevent modification of admin_notes
    IF new.admin_notes IS DISTINCT FROM old.admin_notes THEN
      new.admin_notes = old.admin_notes;
    END IF;
    
    -- Prevent requesters from changing owner_response_notes
    IF auth.uid() = old.requester_id AND new.owner_response_notes IS DISTINCT FROM old.owner_response_notes THEN
      new.owner_response_notes = old.owner_response_notes;
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_listing_request_permissions
  BEFORE UPDATE ON public.listing_requests
  FOR EACH ROW EXECUTE PROCEDURE public.protect_listing_request_fields();

-- Trigger to automatically update updated_at
CREATE TRIGGER listing_requests_updated_at
  BEFORE UPDATE ON public.listing_requests
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
