-- Create roles table for scalable RBAC
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insert the base roles (plus any future ones as requested)
INSERT INTO public.roles (role_name, description) VALUES
  ('renter', 'Can browse and request vehicles'),
  ('owner', 'Can list vehicles and manage their listings'),
  ('admin', 'Has full system access and intermediation privileges'),
  ('driver', 'Future role: Can be hired to drive vehicles'),
  ('dealer', 'Future role: Manages a fleet of vehicles'),
  ('agent', 'Future role: Facilitates transactions'),
  ('property_owner', 'Future role: Owns rental properties');

-- Create user_roles linking table
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, role_id)
);

-- Turn on Row Level Security
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for roles table
-- Everyone can view available roles
CREATE POLICY "Anyone can view roles"
  ON public.roles
  FOR SELECT
  USING (true);

-- No insert/update/delete policies for client -> inherently server/admin controlled only

-- Policies for user_roles table
-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Note: Admin role assignment is server/admin-controlled. 
-- By not providing INSERT/UPDATE/DELETE policies, we guarantee 
-- no client can alter roles. It must be done via the service-role 
-- key (server-side) or by superusers.

-- Refactor profiles table: remove the hardcoded enum role
ALTER TABLE public.profiles DROP COLUMN role;
DROP TYPE public.user_role;

-- Update the user creation trigger to populate user_roles instead
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role text;
  assigned_role_id uuid;
BEGIN
  -- 1. Create the profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );

  -- 2. Determine initial role safely (preventing 'admin' injection)
  IF new.raw_user_meta_data->>'role' = 'owner' THEN
    assigned_role := 'owner';
  ELSE
    assigned_role := 'renter';
  END IF;

  -- 3. Lookup the role ID
  SELECT id INTO assigned_role_id FROM public.roles WHERE role_name = assigned_role;

  -- 4. Assign the role in user_roles
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (new.id, assigned_role_id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
