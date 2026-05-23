-- Create request_status_history table
CREATE TABLE IF NOT EXISTS public.request_status_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid NOT NULL,
  request_table text NOT NULL CHECK (request_table IN ('rental_requests', 'listing_requests')),
  old_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note text,
  is_admin_override boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index for faster lookups by request_id
CREATE INDEX IF NOT EXISTS idx_request_status_history_request_id ON public.request_status_history(request_id);

-- Enable Row Level Security
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;

-- Policies

-- Admins can do everything
CREATE POLICY "Admins can manage request status history"
  ON public.request_status_history
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.role_name = 'admin'
    )
  );

-- For owners/renters to view their own request history, we need to join against rental_requests or listing_requests
-- For simplicity and performance, we'll allow SELECT if they are the owner or renter of the rental_request
CREATE POLICY "Users can view their own rental request history"
  ON public.request_status_history
  FOR SELECT
  USING (
    request_table = 'rental_requests' AND EXISTS (
      SELECT 1 FROM public.rental_requests rr
      JOIN public.listings l ON rr.listing_id = l.id
      WHERE rr.id = request_status_history.request_id
      AND (rr.renter_id = auth.uid() OR l.owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can view their own listing request history"
  ON public.request_status_history
  FOR SELECT
  USING (
    request_table = 'listing_requests' AND EXISTS (
      SELECT 1 FROM public.listing_requests lr
      WHERE lr.id = request_status_history.request_id
      AND lr.requester_id = auth.uid()
    )
  );

-- No public read access
