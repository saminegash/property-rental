-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CLEANUP PREVIOUS SEED DATA (to make seed rerun-safe)
-- We delete in reverse dependency order
DELETE FROM public.request_status_history;
DELETE FROM public.security_deposits;
DELETE FROM public.commissions;
DELETE FROM public.listing_requests;
DELETE FROM public.rental_requests;
DELETE FROM public.listing_images;
DELETE FROM public.sale_terms;
DELETE FROM public.rental_terms;
DELETE FROM public.property_details;
DELETE FROM public.vehicle_details;
DELETE FROM public.listings;
DELETE FROM public.owner_profiles;
DELETE FROM public.user_roles WHERE user_id IN (
  'e2ba414a-81a4-4df1-bc23-ecb7b4d82f71',
  'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72',
  'c3ba414a-81a4-4df1-bc23-ecb7b4d82f73',
  'b2ba414a-81a4-4df1-bc23-ecb7b4d82f74'
);
DELETE FROM public.profiles WHERE user_id IN (
  'e2ba414a-81a4-4df1-bc23-ecb7b4d82f71',
  'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72',
  'c3ba414a-81a4-4df1-bc23-ecb7b4d82f73',
  'b2ba414a-81a4-4df1-bc23-ecb7b4d82f74'
);
DELETE FROM auth.users WHERE id IN (
  'e2ba414a-81a4-4df1-bc23-ecb7b4d82f71',
  'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72',
  'c3ba414a-81a4-4df1-bc23-ecb7b4d82f73',
  'b2ba414a-81a4-4df1-bc23-ecb7b4d82f74'
);

-- ==========================================
-- 1. SEED USERS into auth.users
-- This automatically fires handle_new_user() trigger
-- which creates public.profiles and public.user_roles
-- ==========================================
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  'e2ba414a-81a4-4df1-bc23-ecb7b4d82f71', -- Renter
  '00000000-0000-0000-0000-000000000000',
  'renter@example.com',
  crypt('TestPassword123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Abebe Renter","role":"renter"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated'
), (
  'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72', -- Owner (Verified)
  '00000000-0000-0000-0000-000000000000',
  'owner@example.com',
  crypt('TestPassword123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Bekele Owner","role":"owner"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated'
), (
  'c3ba414a-81a4-4df1-bc23-ecb7b4d82f73', -- Admin
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  crypt('TestPassword123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Mulugeta Admin","role":"renter"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated'
), (
  'b2ba414a-81a4-4df1-bc23-ecb7b4d82f74', -- Owner (Pending)
  '00000000-0000-0000-0000-000000000000',
  'pending_owner@example.com',
  crypt('TestPassword123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Selam Pending Owner","role":"owner"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated'
);

-- ==========================================
-- 2. MANUALLY ASSIGN ADMIN ROLE
-- Upgrade mulugeta from renter to admin in public.user_roles
-- ==========================================
UPDATE public.user_roles
SET role_id = (SELECT id FROM public.roles WHERE role_name = 'admin')
WHERE user_id = 'c3ba414a-81a4-4df1-bc23-ecb7b4d82f73';

-- ==========================================
-- 3. ENRICH PROFILES DATA
-- Add phone and cities to profiles
-- ==========================================
UPDATE public.profiles SET phone = '+251911123456', city = 'Addis Ababa', avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80' WHERE user_id = 'e2ba414a-81a4-4df1-bc23-ecb7b4d82f71';
UPDATE public.profiles SET phone = '+251911654321', city = 'Addis Ababa', avatar_url = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80' WHERE user_id = 'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72';
UPDATE public.profiles SET phone = '+251911999999', city = 'Addis Ababa', avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80' WHERE user_id = 'c3ba414a-81a4-4df1-bc23-ecb7b4d82f73';
UPDATE public.profiles SET phone = '+251911000111', city = 'Hawassa',     avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' WHERE user_id = 'b2ba414a-81a4-4df1-bc23-ecb7b4d82f74';

-- ==========================================
-- 4. SEED OWNER PROFILES
-- Verified and Pending states for dashboards
-- ==========================================
INSERT INTO public.owner_profiles (
  user_id,
  owner_type,
  business_name,
  verification_status,
  admin_notes
) VALUES (
  'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72',
  'rental_company',
  'Ethio Premier Rentals',
  'verified',
  'Verified commercial registration and tax identification certificate.'
), (
  'b2ba414a-81a4-4df1-bc23-ecb7b4d82f74',
  'individual',
  'Selam Private Fleet',
  'pending',
  'Awaiting upload of national ID card backside and driving history verification.'
);

-- ==========================================
-- 5. SEED LISTINGS (vehicle and property)
-- ==========================================
INSERT INTO public.listings (
  id,
  owner_id,
  category,
  listing_type,
  title,
  description,
  location,
  status,
  is_featured,
  admin_notes
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72',
  'vehicle',
  'rent',
  'Toyota Rav4 2022 - Sleek & Modern Hybrid',
  'Beautiful, extremely efficient Toyota Rav4 Hybrid in Silver. Comes equipped with luxury leather seats, panoramic sunroof, Apple CarPlay, and full safety package. Highly suitable for city travel, embassy consultants, and family trips across Ethiopia.',
  'Bole, Addis Ababa',
  'published',
  true,
  'Approved after physical audit. Vehicle in pristine mechanical condition.'
), (
  'a2222222-2222-2222-2222-222222222222',
  'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72',
  'vehicle',
  'rent',
  'Suzuki Dzire 2021 - Highly Fuel Efficient Sedan',
  'Excellent compact sedan, incredibly low fuel consumption. Manual transmission, pristine white paint, very clean interior. Great for day-to-day work commute and business trips inside Addis Ababa. Driver is not provided for this unit.',
  'Kazanchis, Addis Ababa',
  'published',
  false,
  'Standard listing approval. Clean title verified.'
), (
  'a3333333-3333-3333-3333-333333333333',
  'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72',
  'vehicle',
  'sale',
  'Toyota Land Cruiser V8 2020 - Luxury Bulletproof SUV',
  'Rare luxury Land Cruiser V8 Diesel, black exterior, beige leather seats, armored glass protection. Complete service history at Toyota Ethiopia. In pristine condition. Duty-paid. Ready for immediate transfer.',
  'Bole Atlas, Addis Ababa',
  'published',
  true,
  'High-value asset. Ownership documentation cross-checked.'
), (
  'a4444444-4444-4444-4444-444444444444',
  'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72',
  'property',
  'rent',
  'Modern 2-Bedroom Fully Furnished Apartment',
  'Luxury apartment located in Bole Medhanialem. Elegant bedrooms, 2 bathrooms with high-end fixtures. Open kitchen with imported appliances. Amenities include unlimited high-speed Wi-Fi, 24/7 security, back-up generator, continuous water supply, and designated underground parking.',
  'Bole Medhanialem, Addis Ababa',
  'published',
  true,
  'Verified interior photography and title deed.'
), (
  'a5555555-5555-5555-5555-555555555555',
  'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72',
  'property',
  'sale',
  '6-Bedroom Executive Villa with Large Garden',
  'Exquisite newly constructed villa in Old Airport diplomatic enclave. 6 spacious bedrooms, 5 state-of-the-art bathrooms, grand living room with high ceilings, separate professional chef and family kitchens. Massive green lawn compound, staff service quarters, high-security parameter fence.',
  'Old Airport, Addis Ababa',
  'published',
  true,
  'Validated diplomat area permit and structural plans.'
), (
  'a6666666-6666-6666-6666-666666666666',
  'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72',
  'vehicle',
  'rent',
  'Hyundai Atos 2018 - Affordable City Hatchback',
  'Very tidy, simple automatic hatchback. Red color, great for running quick errands around Bole. Submitting this draft listing for verification.',
  'Sarbet, Addis Ababa',
  'pending_review',
  false,
  'Pending owner registration documents validation.'
), (
  'a7777777-7777-7777-7777-777777777777',
  'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72',
  'property',
  'rent',
  '1-Bedroom Studio Apartment',
  'Small studio space in Kality. Basic water and electrical supply. Cheap rental.',
  'Kality, Addis Ababa',
  'rejected',
  false,
  'Lacks sufficient photography and detailed description.'
);

-- ==========================================
-- Add Admin Rejection Reason manually to rejected listing
-- ==========================================
UPDATE public.listings
SET admin_rejection_reason = 'Your listing description is extremely sparse, and there are no interior images uploaded. Please update the photos and details.'
WHERE id = 'a7777777-7777-7777-7777-777777777777';

-- ==========================================
-- 6. SEED VEHICLE DETAILS
-- ==========================================
INSERT INTO public.vehicle_details (
  listing_id,
  vehicle_type_id,
  make,
  model,
  year,
  transmission,
  fuel_type,
  seats,
  mileage,
  color,
  condition
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  (SELECT id FROM public.vehicle_types WHERE slug = 'suv'),
  'Toyota',
  'Rav4 Hybrid',
  2022,
  'automatic',
  'hybrid',
  5,
  12000,
  'Silver',
  'excellent'
), (
  'a2222222-2222-2222-2222-222222222222',
  (SELECT id FROM public.vehicle_types WHERE slug = 'sedan'),
  'Suzuki',
  'Dzire',
  2021,
  'manual',
  'petrol',
  5,
  35000,
  'White',
  'good'
), (
  'a3333333-3333-3333-3333-333333333333',
  (SELECT id FROM public.vehicle_types WHERE slug = 'luxury'),
  'Toyota',
  'Land Cruiser V8',
  2020,
  'automatic',
  'diesel',
  7,
  45000,
  'Black',
  'excellent'
), (
  'a6666666-6666-6666-6666-666666666666',
  (SELECT id FROM public.vehicle_types WHERE slug = 'hatchback'),
  'Hyundai',
  'Atos',
  2018,
  'automatic',
  'petrol',
  4,
  60000,
  'Red',
  'good'
);

-- ==========================================
-- 7. SEED PROPERTY DETAILS
-- ==========================================
INSERT INTO public.property_details (
  listing_id,
  property_type_id,
  bedrooms,
  bathrooms,
  area_sqm,
  floor,
  total_floors,
  furnished_status,
  parking_available,
  compound_available,
  water_available,
  electricity_available,
  internet_available,
  property_condition
) VALUES (
  'a4444444-4444-4444-4444-444444444444',
  (SELECT id FROM public.property_types WHERE name = 'Apartment'),
  2,
  2,
  120,
  4,
  10,
  'fully_furnished',
  true,
  true,
  true,
  true,
  true,
  'excellent'
), (
  'a5555555-5555-5555-5555-555555555555',
  (SELECT id FROM public.property_types WHERE name = 'Villa'),
  6,
  5,
  650,
  1,
  3,
  'unfurnished',
  true,
  true,
  true,
  true,
  true,
  'newly_built'
), (
  'a7777777-7777-7777-7777-777777777777',
  (SELECT id FROM public.property_types WHERE name = 'Studio'),
  1,
  1,
  40,
  1,
  1,
  'unfurnished',
  false,
  false,
  true,
  true,
  false,
  'fair'
);

-- ==========================================
-- 8. SEED RENTAL TERMS
-- ==========================================
INSERT INTO public.rental_terms (
  listing_id,
  available_with_driver,
  available_without_driver,
  daily_price,
  weekly_price,
  monthly_price,
  daily_driver_fee,
  weekly_driver_fee,
  monthly_driver_fee,
  security_deposit_amount,
  minimum_rental_days,
  pickup_available,
  delivery_available,
  delivery_fee,
  estimated_delivery_time,
  rental_notes
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  true,
  true,
  3500,
  22000,
  80000,
  500,
  3000,
  10000,
  15000,
  2,
  true,
  true,
  1000,
  'Within 2 hours',
  'Includes full premium insurance. The vehicle should be returned cleaned and with a full tank.'
), (
  'a2222222-2222-2222-2222-222222222222',
  false,
  true,
  1800,
  11000,
  40000,
  0,
  0,
  0,
  5000,
  1,
  true,
  false,
  0,
  NULL,
  'Minimum renter age is 23 years. Copy of driving license and passport/national ID required.'
), (
  'a4444444-4444-4444-4444-444444444444',
  false,
  true,
  4000,
  25000,
  95000,
  0,
  0,
  0,
  95000,
  3,
  true,
  false,
  0,
  NULL,
  'Ideal for corporate housing or foreign expats. Electricity and cleaning services included.'
), (
  'a6666666-6666-6666-6666-666666666666',
  false,
  true,
  1200,
  NULL,
  NULL,
  0,
  0,
  0,
  3000,
  1,
  true,
  false,
  0,
  NULL,
  'Fuel tank must be full upon return. Only for local driving inside Addis Ababa ring road.'
), (
  'a7777777-7777-7777-7777-777777777777',
  false,
  true,
  500,
  NULL,
  NULL,
  0,
  0,
  0,
  1000,
  30,
  true,
  false,
  0,
  NULL,
  'Long term renter preferred. Payment in advance.'
);

-- ==========================================
-- 9. SEED SALE TERMS
-- ==========================================
INSERT INTO public.sale_terms (
  listing_id,
  sale_price,
  is_negotiable,
  sale_notes
) VALUES (
  'a3333333-3333-3333-3333-333333333333',
  15000000,
  true,
  'Title transfer tax to be shared evenly between buyer and seller. Serious inquiries only.'
), (
  'a5555555-5555-5555-5555-555555555555',
  85000000,
  true,
  'Payment in USD or equivalent EUR into an offshore account is highly preferred, but Birr transactions are accepted.'
);

-- ==========================================
-- 10. SEED LISTING IMAGES
-- Using high-quality unsplash links
-- ==========================================
INSERT INTO public.listing_images (
  listing_id,
  image_url,
  storage_path,
  is_primary,
  sort_order
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&h=500&q=80',
  'a1111111-1111-1111-1111-111111111111/car1.jpg',
  true,
  1
), (
  'a1111111-1111-1111-1111-111111111111',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&h=500&q=80',
  'a1111111-1111-1111-1111-111111111111/car2.jpg',
  false,
  2
), (
  'a2222222-2222-2222-2222-222222222222',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&h=500&q=80',
  'a2222222-2222-2222-2222-222222222222/car1.jpg',
  true,
  1
), (
  'a3333333-3333-3333-3333-333333333333',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&h=500&q=80',
  'a3333333-3333-3333-3333-333333333333/car1.jpg',
  true,
  1
), (
  'a4444444-4444-4444-4444-444444444444',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&h=500&q=80',
  'a4444444-4444-4444-4444-444444444444/prop1.jpg',
  true,
  1
), (
  'a4444444-4444-4444-4444-444444444444',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&h=500&q=80',
  'a4444444-4444-4444-4444-444444444444/prop2.jpg',
  false,
  2
), (
  'a5555555-5555-5555-5555-555555555555',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&h=500&q=80',
  'a5555555-5555-5555-5555-555555555555/prop1.jpg',
  true,
  1
);

-- ==========================================
-- 11. SEED RENTAL REQUESTS
-- ==========================================
INSERT INTO public.rental_requests (
  id,
  listing_id,
  renter_id,
  renter_name,
  renter_phone,
  renter_email,
  start_date,
  end_date,
  needs_driver,
  needs_delivery,
  delivery_location,
  message,
  status,
  admin_notes,
  owner_response_notes
) VALUES (
  'f1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111', -- Rav4
  'e2ba414a-81a4-4df1-bc23-ecb7b4d82f71', -- Abebe Renter
  'Abebe Renter',
  '+251911123456',
  'renter@example.com',
  '2026-06-01',
  '2026-06-10',
  false,
  true,
  'Sheraton Hotel, Addis Ababa',
  'Renting this vehicle for a visiting colleague. Need delivery to Sheraton Hotel lobby at 9 AM.',
  'confirmed',
  'Admin audited request. Security deposit collected, verified renter identification.',
  'Confirmed receipt of deposit. The vehicle will be dispatched on time.'
), (
  'f2222222-2222-2222-2222-222222222222',
  'a2222222-2222-2222-2222-222222222222', -- Suzuki Dzire
  'e2ba414a-81a4-4df1-bc23-ecb7b4d82f71', -- Abebe Renter
  'Abebe Renter',
  '+251911123456',
  'renter@example.com',
  '2026-06-15',
  '2026-06-20',
  false,
  false,
  NULL,
  'Hi, requesting this Suzuki for a short city errand cycle. Valid license attached.',
  'new_request',
  NULL,
  NULL
), (
  'f3333333-3333-3333-3333-333333333333',
  'a1111111-1111-1111-1111-111111111111', -- Rav4
  'e2ba414a-81a4-4df1-bc23-ecb7b4d82f71', -- Abebe Renter
  'Abebe Renter',
  '+251911123456',
  'renter@example.com',
  '2026-06-22',
  '2026-06-25',
  true,
  false,
  NULL,
  'Need it with a driver for a business roadtrip down to Hawassa.',
  'owner_contacted',
  'Verified licensing and driver availability.',
  NULL
);

-- ==========================================
-- 12. SEED LISTING REQUESTS
-- ==========================================
INSERT INTO public.listing_requests (
  id,
  listing_id,
  requester_id,
  requester_name,
  requester_phone,
  requester_email,
  request_type,
  message,
  preferred_contact_method,
  preferred_viewing_date,
  budget_amount,
  status,
  admin_notes,
  owner_response_notes
) VALUES (
  'f4444444-4444-4444-4444-444444444444',
  'a3333333-3333-3333-3333-333333333333', -- V8 LC
  'e2ba414a-81a4-4df1-bc23-ecb7b4d82f71', -- Abebe
  'Abebe Renter',
  '+251911123456',
  'renter@example.com',
  'buy',
  'Extremely interested in this armored vehicle. Ready to pay immediately if we can agree on a slight discount.',
  'phone',
  '2026-05-30',
  14500000,
  'owner_contacted',
  'Serious corporate buyer verified. Passed to owner.',
  NULL
), (
  'f5555555-5555-5555-5555-555555555555',
  'a5555555-5555-5555-5555-555555555555', -- Old Airport Villa
  'e2ba414a-81a4-4df1-bc23-ecb7b4d82f71', -- Abebe
  'Abebe Renter',
  '+251911123456',
  'renter@example.com',
  'sale_inquiry',
  'Looking on behalf of an embassy. Is the rental or purchase price flexible for diplomatic clients?',
  'email',
  '2026-06-05',
  80000000,
  'new_request',
  NULL,
  NULL
);

-- ==========================================
-- 13. SEED REQUEST STATUS HISTORY LOGS
-- ==========================================
INSERT INTO public.request_status_history (
  request_id,
  request_table,
  old_status,
  new_status,
  changed_by,
  note,
  is_admin_override
) VALUES (
  'f1111111-1111-1111-1111-111111111111',
  'rental_requests',
  'new_request',
  'admin_reviewing',
  'c3ba414a-81a4-4df1-bc23-ecb7b4d82f73',
  'Admin checking renter background.',
  true
), (
  'f1111111-1111-1111-1111-111111111111',
  'rental_requests',
  'admin_reviewing',
  'owner_contacted',
  'c3ba414a-81a4-4df1-bc23-ecb7b4d82f73',
  'Identity verified, forwarding to vehicle owner.',
  true
), (
  'f1111111-1111-1111-1111-111111111111',
  'rental_requests',
  'owner_contacted',
  'owner_available',
  'd4ba414a-81a4-4df1-bc23-ecb7b4d82f72',
  'Vehicle verified available for those dates.',
  false
), (
  'f1111111-1111-1111-1111-111111111111',
  'rental_requests',
  'owner_available',
  'confirmed',
  'c3ba414a-81a4-4df1-bc23-ecb7b4d82f73',
  'Deposit and rental agreement locked in by administrator.',
  true
), (
  'f3333333-3333-3333-3333-333333333333',
  'rental_requests',
  'new_request',
  'admin_reviewing',
  'c3ba414a-81a4-4df1-bc23-ecb7b4d82f73',
  'Checking licensing details.',
  true
), (
  'f3333333-3333-3333-3333-333333333333',
  'rental_requests',
  'admin_reviewing',
  'owner_contacted',
  'c3ba414a-81a4-4df1-bc23-ecb7b4d82f73',
  'Verified, sent to owner to verify driver availability.',
  true
), (
  'f4444444-4444-4444-4444-444444444444',
  'listing_requests',
  'new_request',
  'admin_reviewing',
  'c3ba414a-81a4-4df1-bc23-ecb7b4d82f73',
  'Evaluating buyer details.',
  true
), (
  'f4444444-4444-4444-4444-444444444444',
  'listing_requests',
  'admin_reviewing',
  'owner_contacted',
  'c3ba414a-81a4-4df1-bc23-ecb7b4d82f73',
  'Embassy affiliate buyer approved, forwarding request.',
  true
);

-- ==========================================
-- 14. SEED COMMISSIONS
-- Short-term flat-fee commission tier
-- ==========================================
INSERT INTO public.commissions (
  rental_request_id,
  commission_rate,
  commission_base_amount,
  commission_amount,
  commission_status,
  commission_type,
  rental_days
) VALUES (
  'f1111111-1111-1111-1111-111111111111', -- Confirmed Rav4 (10 days, short-term)
  0.00,
  35000, -- 3500 daily * 10 days
  600,   -- flat fee for daily price between 2001 and 5000 Birr
  'collected',
  'flat_fee',
  10
);

-- ==========================================
-- 15. SEED SECURITY DEPOSITS
-- ==========================================
INSERT INTO public.security_deposits (
  rental_request_id,
  deposit_amount,
  deposit_status,
  payment_method,
  admin_notes
) VALUES (
  'f1111111-1111-1111-1111-111111111111',
  15000,
  'collected',
  'Bank Transfer (CBE)',
  'Deposit verified on CBE mobile app, receipt ID CBE882319401.'
), (
  'f3333333-3333-3333-3333-333333333333',
  15000,
  'pending',
  NULL,
  'Awaiting deposit payment link confirmation.'
);
