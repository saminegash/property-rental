-- 1. DROP OLD STORAGE POLICIES
DROP POLICY IF EXISTS "Public can view listing images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view listing images for published listings" ON storage.objects;
DROP POLICY IF EXISTS "Owners can view their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can upload images to their listings" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update their listing images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete their listing images" ON storage.objects;

-- 2. DROP OLD TRIGGERS AND FUNCTIONS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.protect_owner_admin_fields() CASCADE;
DROP FUNCTION IF EXISTS public.protect_rental_request_fields() CASCADE;
DROP FUNCTION IF EXISTS public.protect_listing_request_fields() CASCADE;
DROP FUNCTION IF EXISTS public.check_rental_completed_before_review() CASCADE;

-- 3. DROP OLD VIEWS
DROP VIEW IF EXISTS public.owner_public_profiles CASCADE;

-- 4. DROP OLD TABLES
DROP TABLE IF EXISTS public.request_status_history CASCADE;
DROP TABLE IF EXISTS public.listing_events CASCADE;
DROP TABLE IF EXISTS public.rental_reviews CASCADE;
DROP TABLE IF EXISTS public.commissions CASCADE;
DROP TABLE IF EXISTS public.security_deposits CASCADE;
DROP TABLE IF EXISTS public.pending_price_changes CASCADE;
DROP TABLE IF EXISTS public.rental_requests CASCADE;
DROP TABLE IF EXISTS public.listing_requests CASCADE;
DROP TABLE IF EXISTS public.property_details CASCADE;
DROP TABLE IF EXISTS public.property_types CASCADE;
DROP TABLE IF EXISTS public.vehicle_details CASCADE;
DROP TABLE IF EXISTS public.vehicle_types CASCADE;
DROP TABLE IF EXISTS public.rental_terms CASCADE;
DROP TABLE IF EXISTS public.sale_terms CASCADE;
DROP TABLE IF EXISTS public.listing_images CASCADE;
DROP TABLE IF EXISTS public.owner_profiles CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- 5. DROP OLD TYPES
DROP TYPE IF EXISTS public.commission_status CASCADE;
DROP TYPE IF EXISTS public.security_deposit_status CASCADE;
DROP TYPE IF EXISTS public.listing_request_type CASCADE;
DROP TYPE IF EXISTS public.listing_request_status CASCADE;
DROP TYPE IF EXISTS public.rental_request_status CASCADE;
DROP TYPE IF EXISTS public.listing_event_type CASCADE;
DROP TYPE IF EXISTS public.furnished_status CASCADE;
DROP TYPE IF EXISTS public.property_condition CASCADE;
DROP TYPE IF EXISTS public.vehicle_condition CASCADE;
DROP TYPE IF EXISTS public.fuel_type CASCADE;
DROP TYPE IF EXISTS public.transmission_type CASCADE;
DROP TYPE IF EXISTS public.verification_status CASCADE;
DROP TYPE IF EXISTS public.owner_type CASCADE;
DROP TYPE IF EXISTS public.review_role CASCADE;
DROP TYPE IF EXISTS public.listing_status CASCADE;
DROP TYPE IF EXISTS public.listing_type CASCADE;
DROP TYPE IF EXISTS public.listing_category CASCADE;

-- 6. CREATE NEW ENUMS
CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending', 'verified', 'suspended');
CREATE TYPE public.app_role AS ENUM ('user', 'owner', 'admin');
CREATE TYPE public.property_type AS ENUM (
  'apartment', 'house', 'villa', 'condominium',
  'studio', 'land', 'commercial', 'warehouse', 'vehicle'
);
CREATE TYPE public.listing_type AS ENUM ('rent', 'sale');
CREATE TYPE public.listing_status AS ENUM (
  'draft', 'pending_review', 'published', 'rejected', 'archived'
);
CREATE TYPE public.request_type AS ENUM (
  'rental', 'purchase', 'viewing', 'info'
);
CREATE TYPE public.request_status AS ENUM (
  'new', 'admin_reviewing', 'owner_contacted', 'owner_responded',
  'confirmed', 'completed', 'rejected', 'cancelled'
);
CREATE TYPE public.deposit_status AS ENUM (
  'pending', 'collected', 'returned', 'forfeited'
);
CREATE TYPE public.commission_status AS ENUM (
  'pending', 'collected', 'waived'
);

-- 7. MODIFY PROFILES TABLE
-- Assuming profiles table exists with basic fields, adding the new ones
ALTER TABLE public.profiles
  ADD COLUMN business_name text,
  ADD COLUMN verification_status public.verification_status NOT NULL DEFAULT 'unverified'::public.verification_status;

-- Ensure RLS on profiles is clean
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 8. CREATE USER_ROLES TABLE
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 9. RLS HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_role(required_role public.app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = required_role
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Re-add profiles RLS using helpers
CREATE POLICY "Users can view and update own profile"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- User_roles RLS
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 10. CREATE LISTINGS TABLE
CREATE TABLE public.listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id), -- No cascade delete
  property_type public.property_type NOT NULL,
  listing_type public.listing_type NOT NULL,
  title text NOT NULL,
  description text,
  city text,
  sub_city text,
  location_detail text,
  latitude numeric,
  longitude numeric,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'ETB',
  bedrooms integer,
  bathrooms integer,
  area_sqm numeric,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  tiktok_video_url text,
  security_deposit_amount numeric,
  status public.listing_status NOT NULL DEFAULT 'draft'::public.listing_status,
  is_featured boolean NOT NULL DEFAULT false,
  views_count integer NOT NULL DEFAULT 0,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_owner_id ON public.listings(owner_id);
CREATE INDEX idx_listings_property_type ON public.listings(property_type);
CREATE INDEX idx_listings_listing_type ON public.listings(listing_type);
CREATE INDEX idx_listings_city ON public.listings(city);
CREATE INDEX idx_listings_deleted_at ON public.listings(deleted_at);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_owner_of(lid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = lid AND owner_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE POLICY "Public can view published and active listings"
  ON public.listings FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Owners can view own listings"
  ON public.listings FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert own listings"
  ON public.listings FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own active listings"
  ON public.listings FOR UPDATE
  USING (owner_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Admins can view all listings"
  ON public.listings FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all listings"
  ON public.listings FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 11. CREATE LISTING IMAGES TABLE
CREATE TABLE public.listing_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  storage_path text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_listing_images_listing_id ON public.listing_images(listing_id);
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view images of published listings"
  ON public.listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.status = 'published' AND l.deleted_at IS NULL
    )
  );

CREATE POLICY "Owners can manage own listing images"
  ON public.listing_images FOR ALL
  USING (public.is_owner_of(listing_id))
  WITH CHECK (public.is_owner_of(listing_id));

CREATE POLICY "Admins can manage all listing images"
  ON public.listing_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 12. CREATE REQUESTS TABLE
CREATE TABLE public.requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id), -- No cascade
  user_id uuid REFERENCES auth.users(id), -- Nullable for guests
  request_type public.request_type NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  phone_verified boolean NOT NULL DEFAULT false,
  message text,
  start_date date,
  end_date date,
  offered_price numeric,
  status public.request_status NOT NULL DEFAULT 'new'::public.request_status,
  admin_notes text,
  owner_response_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

CREATE INDEX idx_requests_listing_id ON public.requests(listing_id);
CREATE INDEX idx_requests_user_id ON public.requests(user_id);
CREATE INDEX idx_requests_status ON public.requests(status);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests"
  ON public.requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can create requests"
  ON public.requests FOR INSERT
  WITH CHECK (status = 'new');

CREATE POLICY "Owners can view requests for own listings post-review"
  ON public.requests FOR SELECT
  USING (
    public.is_owner_of(listing_id) AND status NOT IN ('new', 'admin_reviewing')
  );

CREATE POLICY "Owners can update owner_response_notes"
  ON public.requests FOR UPDATE
  USING (
    public.is_owner_of(listing_id) AND status IN ('owner_contacted', 'owner_responded')
  )
  WITH CHECK (
    public.is_owner_of(listing_id)
  );

CREATE POLICY "Admins can manage all requests"
  ON public.requests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 13. CREATE REQUEST EVENTS TABLE (Audit Trail)
CREATE TABLE public.request_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.requests(id), -- No cascade
  old_status public.request_status,
  new_status public.request_status NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  note text,
  is_admin_action boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_request_events_request_id ON public.request_events(request_id);
ALTER TABLE public.request_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view events for own listing requests"
  ON public.request_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_id AND public.is_owner_of(r.listing_id)
    )
  );

CREATE POLICY "Admins can manage all request events"
  ON public.request_events FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 14. CREATE SECURITY DEPOSITS TABLE
CREATE TABLE public.security_deposits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id),
  request_id uuid NOT NULL REFERENCES public.requests(id),
  deposit_amount numeric NOT NULL,
  deposit_status public.deposit_status NOT NULL DEFAULT 'pending'::public.deposit_status,
  payment_method text,
  payment_reference text,
  collected_by uuid REFERENCES auth.users(id),
  admin_notes text,
  collected_at timestamp with time zone,
  returned_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_security_deposits_listing_id ON public.security_deposits(listing_id);
CREATE INDEX idx_security_deposits_request_id ON public.security_deposits(request_id);

ALTER TABLE public.security_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view security deposits on own listings"
  ON public.security_deposits FOR SELECT
  USING (public.is_owner_of(listing_id));

CREATE POLICY "Admins can manage all security deposits"
  ON public.security_deposits FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 15. CREATE COMMISSIONS TABLE
CREATE TABLE public.commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id),
  request_id uuid REFERENCES public.requests(id),
  listing_type public.listing_type NOT NULL,
  deal_amount numeric NOT NULL,
  commission_rate numeric NOT NULL,
  commission_amount numeric NOT NULL,
  status public.commission_status NOT NULL DEFAULT 'pending'::public.commission_status,
  payment_reference text,
  collected_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_commissions_listing_id ON public.commissions(listing_id);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view commissions on own listings"
  ON public.commissions FOR SELECT
  USING (public.is_owner_of(listing_id));

CREATE POLICY "Admins can manage all commissions"
  ON public.commissions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Auto-calculate commission_amount trigger
CREATE OR REPLACE FUNCTION public.calculate_commission_amount()
RETURNS trigger AS $$
BEGIN
  NEW.commission_amount := NEW.deal_amount * NEW.commission_rate;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_commission_before_insert_update
  BEFORE INSERT OR UPDATE ON public.commissions
  FOR EACH ROW EXECUTE PROCEDURE public.calculate_commission_amount();

-- 16. CREATE SAVED LISTINGS TABLE
CREATE TABLE public.saved_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved listings"
  ON public.saved_listings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 17. REWRITE HANDLE NEW USER TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );

  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user'::public.app_role);

  -- If meta-data indicates they want to be an owner, add owner role too
  IF new.raw_user_meta_data->>'role' = 'owner' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'owner'::public.app_role);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 18. ADD UPDATED_AT TRIGGERS
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER requests_updated_at BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 19. RECREATE STORAGE BUCKET POLICIES
-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Owners can upload images to their listings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated' AND
    public.is_owner_of((string_to_array(name, '/'))[1]::uuid)
  );

CREATE POLICY "Owners can update their listing images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated' AND
    public.is_owner_of((string_to_array(name, '/'))[1]::uuid)
  );

CREATE POLICY "Owners can delete their listing images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated' AND
    public.is_owner_of((string_to_array(name, '/'))[1]::uuid)
  );
