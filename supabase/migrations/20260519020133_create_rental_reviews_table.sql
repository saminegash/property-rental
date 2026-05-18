-- Create enum for review roles
CREATE TYPE public.review_role AS ENUM (
  'owner',
  'renter',
  'admin'
);

-- Create rental_reviews table
CREATE TABLE public.rental_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_request_id uuid NOT NULL REFERENCES public.rental_requests(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_role public.review_role NOT NULL,
  reviewee_role public.review_role NOT NULL,
  
  -- Ratings (1-5 scale)
  overall_rating integer NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  communication_rating integer NOT NULL CHECK (communication_rating BETWEEN 1 AND 5),
  punctuality_rating integer NOT NULL CHECK (punctuality_rating BETWEEN 1 AND 5),
  
  -- Specific ratings depending on role
  car_condition_rating integer CHECK (car_condition_rating BETWEEN 1 AND 5),
  car_care_rating integer CHECK (car_care_rating BETWEEN 1 AND 5),
  payment_reliability_rating integer CHECK (payment_reliability_rating BETWEEN 1 AND 5),
  
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  
  -- One review per reviewer per rental request
  UNIQUE(rental_request_id, reviewer_id)
);

-- Indexes for frequent queries
CREATE INDEX idx_rental_reviews_rental_request_id ON public.rental_reviews(rental_request_id);
CREATE INDEX idx_rental_reviews_reviewee_id ON public.rental_reviews(reviewee_id);
CREATE INDEX idx_rental_reviews_reviewer_id ON public.rental_reviews(reviewer_id);

-- Enable Row Level Security
ALTER TABLE public.rental_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.rental_reviews
  FOR SELECT
  USING (true);

-- Policy: Users can insert reviews for completed rentals they were part of
CREATE POLICY "Users can insert reviews for completed rentals"
  ON public.rental_reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id 
    AND 
    EXISTS (
      SELECT 1 FROM public.rental_requests rr
      JOIN public.listings l ON rr.listing_id = l.id
      WHERE rr.id = rental_request_id
      AND rr.status = 'completed'::public.rental_request_status
      AND (
        rr.renter_id = auth.uid() OR l.owner_id = auth.uid()
      )
    )
  );

-- Policy: Reviewers can update their own reviews
CREATE POLICY "Reviewers can update their own reviews"
  ON public.rental_reviews
  FOR UPDATE
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Trigger to strictly enforce that reviews can only be submitted for completed rentals
CREATE OR REPLACE FUNCTION public.check_rental_completed_before_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.rental_requests
    WHERE id = NEW.rental_request_id
    AND status = 'completed'::public.rental_request_status
  ) THEN
    RAISE EXCEPTION 'Reviews can only be submitted for completed rental requests.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_completed_rental_review
  BEFORE INSERT OR UPDATE ON public.rental_reviews
  FOR EACH ROW EXECUTE PROCEDURE public.check_rental_completed_before_review();
