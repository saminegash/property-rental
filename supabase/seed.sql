-- ==========================================
-- FRESH SEED DATA FOR 9-TABLE SCHEMA
-- ==========================================

-- Clean slate for seed
TRUNCATE TABLE auth.users CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
-- Other tables cascade automatically from auth.users (except user_roles and listings which will also be cleared because of auth.users CASCADE, wait user_roles has CASCADE, listings DOES NOT have CASCADE on owner_id!)
-- Oh right, listings owner_id does NOT cascade. So I need to truncate listings explicitly.
TRUNCATE TABLE public.listings CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;

-- 1. Create 3 test users (user, owner, admin) in auth.users
-- Password for all is 'password123'
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
  email_change, phone_change_token, reauthentication_token
) VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Test User"}', now(), now(), '', '', '', '', '', '', ''),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Test Owner", "role": "owner"}', now(), now(), '', '', '', '', '', '', ''),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Test Admin"}', now(), now(), '', '', '', '', '', '', '');

-- The handle_new_user trigger automatically created profiles and basic roles.
-- Let's update the admin profile and role manually.
UPDATE public.profiles SET verification_status = 'verified' WHERE user_id = '22222222-2222-2222-2222-222222222222';
INSERT INTO public.user_roles (user_id, role) VALUES ('33333333-3333-3333-3333-333333333333', 'admin');

-- 2. Create Sample Listings (for the owner)
INSERT INTO public.listings (
  id, owner_id, property_type, listing_type, title, description, city, sub_city, 
  price, bedrooms, bathrooms, area_sqm, details, security_deposit_amount, status, is_featured
) VALUES 
  (
    'aaaa1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 
    'apartment', 'rent', 'Luxury Bole Apartment', 'Beautiful 3 bed apartment in the heart of Bole.',
    'Addis Ababa', 'Bole', 80000, 3, 2, 120, 
    '{"floor": 4, "furnished_status": "fully_furnished", "parking_available": true}',
    20000, 'published', true
  ),
  (
    'bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 
    'vehicle', 'rent', '2023 Toyota Rav4 Hybrid', 'Excellent condition Rav4, available for weekly rentals.',
    'Addis Ababa', 'Kirkos', 3500, null, null, null, 
    '{"make": "Toyota", "model": "Rav4", "year": 2023, "transmission": "automatic", "fuel_type": "hybrid"}',
    15000, 'published', false
  ),
  (
    'cccc3333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 
    'villa', 'sale', 'Spacious CMC Villa', 'Family home with large garden.',
    'Addis Ababa', 'CMC', 45000000, 5, 4, 300, 
    '{"furnished_status": "unfurnished", "parking_available": true}',
    null, 'published', true
  );

-- 3. Add Listing Images
INSERT INTO public.listing_images (listing_id, image_url, storage_path, is_primary) VALUES 
  ('aaaa1111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', 'sample/apt1.jpg', true),
  ('bbbb2222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1590362891991-f776e747a588', 'sample/car1.jpg', true),
  ('cccc3333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', 'sample/villa1.jpg', true);

-- 4. Create Requests
INSERT INTO public.requests (
  id, listing_id, user_id, request_type, name, phone, email, 
  status, message, start_date, end_date
) VALUES 
  (
    'dddd4444-4444-4444-4444-444444444444', 'aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
    'rental', 'Test User', '+251911000000', 'user@example.com',
    'completed', 'Looking to rent for 6 months.', '2026-06-01', '2026-12-01'
  ),
  (
    'eeee5555-5555-5555-5555-555555555555', 'cccc3333-3333-3333-3333-333333333333', null,
    'purchase', 'Guest Buyer', '+251922000000', null,
    'new', 'Is the price negotiable?', null, null
  );

-- 5. Request Events Audit Trail
INSERT INTO public.request_events (request_id, old_status, new_status, changed_by, is_admin_action) VALUES 
  ('dddd4444-4444-4444-4444-444444444444', null, 'new', '11111111-1111-1111-1111-111111111111', false),
  ('dddd4444-4444-4444-4444-444444444444', 'new', 'admin_reviewing', '33333333-3333-3333-3333-333333333333', true),
  ('dddd4444-4444-4444-4444-444444444444', 'admin_reviewing', 'owner_contacted', '33333333-3333-3333-3333-333333333333', true),
  ('dddd4444-4444-4444-4444-444444444444', 'owner_contacted', 'confirmed', '33333333-3333-3333-3333-333333333333', true),
  ('dddd4444-4444-4444-4444-444444444444', 'confirmed', 'completed', '33333333-3333-3333-3333-333333333333', true);

-- 6. Security Deposit
INSERT INTO public.security_deposits (
  listing_id, request_id, deposit_amount, deposit_status, payment_method, collected_by
) VALUES (
  'aaaa1111-1111-1111-1111-111111111111', 'dddd4444-4444-4444-4444-444444444444', 
  20000, 'collected', 'CBE Transfer', '33333333-3333-3333-3333-333333333333'
);

-- 7. Commission
INSERT INTO public.commissions (
  listing_id, request_id, listing_type, deal_amount, commission_rate, status, collected_by
) VALUES (
  'aaaa1111-1111-1111-1111-111111111111', 'dddd4444-4444-4444-4444-444444444444',
  'rent', 80000, 0.06, 'collected', '33333333-3333-3333-3333-333333333333'
);
