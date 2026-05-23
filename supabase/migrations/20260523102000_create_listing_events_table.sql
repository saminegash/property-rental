-- Create listing_event_type enum
CREATE TYPE public.listing_event_type AS ENUM (
  'view',
  'request_click',
  'favorite_click',
  'share_click'
);

-- Create listing_events table
CREATE TABLE public.listing_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  event_type public.listing_event_type NOT NULL,
  viewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.listing_events ENABLE ROW LEVEL SECURITY;

-- Create Indexes
CREATE INDEX idx_listing_events_listing_id ON public.listing_events(listing_id);
CREATE INDEX idx_listing_events_event_type ON public.listing_events(event_type);
CREATE INDEX idx_listing_events_created_at ON public.listing_events(created_at);

-- RLS Policies

-- Public can insert safe analytics events for published listings
CREATE POLICY "Public can insert safe events for published listings"
  ON public.listing_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_events.listing_id
      AND status = 'published'
    )
  );

-- Owners can view aggregated analytics for their own listings
CREATE POLICY "Owners can view events for their own listings"
  ON public.listing_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_events.listing_id
      AND owner_id = auth.uid()
    )
  );
