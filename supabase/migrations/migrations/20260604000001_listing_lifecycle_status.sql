-- Add new terminal states so the public site can hide deals that are done.
ALTER TYPE public.listing_status ADD VALUE IF NOT EXISTS 'reserved';   -- request confirmed, deal in escrow
ALTER TYPE public.listing_status ADD VALUE IF NOT EXISTS 'rented';     -- rental deal closed
ALTER TYPE public.listing_status ADD VALUE IF NOT EXISTS 'sold';       -- sale deal closed
ALTER TYPE public.listing_status ADD VALUE IF NOT EXISTS 'inactive';   -- owner-paused, can be reactivated

-- A request being "confirmed" means an owner has accepted but money hasn't
-- moved yet. "completed" means the deal is done.
-- Auto-transition the listing when the request lifecycle says so.
CREATE OR REPLACE FUNCTION public.sync_listing_status_from_request()
RETURNS trigger AS $$
DECLARE
  l_type public.listing_type;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  SELECT listing_type INTO l_type FROM public.listings WHERE id = NEW.listing_id;

  IF NEW.status = 'confirmed' THEN
    UPDATE public.listings
      SET status = 'reserved'
      WHERE id = NEW.listing_id AND status = 'published';
  ELSIF NEW.status = 'completed' THEN
    UPDATE public.listings
      SET status = CASE WHEN l_type = 'rent' THEN 'rented'::public.listing_status
                        ELSE 'sold'::public.listing_status END
      WHERE id = NEW.listing_id;

    -- Cancel any sibling requests that were still in flight on this listing
    UPDATE public.requests
      SET status = 'cancelled',
          admin_notes = COALESCE(admin_notes,'') ||
            E'\n[auto] Cancelled because listing was marked ' ||
            CASE WHEN l_type = 'rent' THEN 'rented.' ELSE 'sold.' END
      WHERE listing_id = NEW.listing_id
        AND id <> NEW.id
        AND status NOT IN ('completed','rejected','cancelled');
  ELSIF NEW.status IN ('rejected','cancelled') AND OLD.status = 'confirmed' THEN
    -- Deal fell through, put the listing back on the market
    UPDATE public.listings
      SET status = 'published'
      WHERE id = NEW.listing_id AND status = 'reserved';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_sync_listing_status_from_request
  AFTER UPDATE OF status ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.sync_listing_status_from_request();