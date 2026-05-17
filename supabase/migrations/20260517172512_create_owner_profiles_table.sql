-- Create enum for owner types
CREATE TYPE public.owner_type AS ENUM ('individual', 'rental_company', 'dealer');

-- Create enum for verification statuses
CREATE TYPE public.verification_status AS ENUM (
  'not_submitted',
  'pending',
  'verified',
  'rejected',
  'suspended'
);

-- Create the owner_profiles table
CREATE TABLE public.owner_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_type public.owner_type NOT NULL DEFAULT 'individual'::public.owner_type,
  business_name text,
  verification_status public.verification_status NOT NULL DEFAULT 'not_submitted'::public.verification_status,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Turn on Row Level Security
ALTER TABLE public.owner_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view their own profile
CREATE POLICY "Owners can view their own owner profile"
  ON public.owner_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Owners can insert their own profile
CREATE POLICY "Owners can insert their own owner profile"
  ON public.owner_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Owners can update their own profile
CREATE POLICY "Owners can update their own owner profile"
  ON public.owner_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note: Admin access (Review all owner profiles) is natively supported 
-- via the SUPABASE_SERVICE_ROLE_KEY which bypasses RLS, as mandated by 
-- the constitution. No additional RLS SELECT/UPDATE policy is required 
-- for admins, keeping the implementation simple and secure.

-- Prevent authenticated users from modifying restricted fields
-- Only the service_role (or superuser) can bypass this trigger
CREATE OR REPLACE FUNCTION public.protect_owner_admin_fields()
RETURNS trigger AS $$
BEGIN
  IF current_user = 'authenticator' THEN
    IF new.verification_status IS DISTINCT FROM old.verification_status THEN
      new.verification_status = old.verification_status;
    END IF;
    IF new.admin_notes IS DISTINCT FROM old.admin_notes THEN
      new.admin_notes = old.admin_notes;
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_owner_admin_fields
  BEFORE UPDATE ON public.owner_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_owner_admin_fields();

-- Trigger to automatically update updated_at
CREATE TRIGGER owner_profiles_updated_at
  BEFORE UPDATE ON public.owner_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
