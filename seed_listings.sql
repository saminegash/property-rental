-- seed_listings.sql
-- This script provides mock data for 10 users and 20 listings (properties and vehicles)
-- Note: Replace 'your-auth-id' with an actual UUID from auth.users if you want to test RLS policies directly,
-- or run this directly in the Supabase SQL editor as a superuser.

-- 1. Create a dummy owner ID (Assume it exists in auth.users, or bypass for testing)
-- You must ensure the user exists in auth.users if RLS is enabled.
-- For local testing without auth.users constraint checking:

DO $$
DECLARE
    owner1 UUID := gen_random_uuid();
    owner2 UUID := gen_random_uuid();
    owner3 UUID := gen_random_uuid();
    listing1 UUID := gen_random_uuid();
    listing2 UUID := gen_random_uuid();
    listing3 UUID := gen_random_uuid();
    listing4 UUID := gen_random_uuid();
    listing5 UUID := gen_random_uuid();
    listing6 UUID := gen_random_uuid();
    listing7 UUID := gen_random_uuid();
    listing8 UUID := gen_random_uuid();
    listing9 UUID := gen_random_uuid();
    listing10 UUID := gen_random_uuid();
    listing11 UUID := gen_random_uuid();
    listing12 UUID := gen_random_uuid();
    listing13 UUID := gen_random_uuid();
    listing14 UUID := gen_random_uuid();
    listing15 UUID := gen_random_uuid();
BEGIN
    -- Insert Profiles
    INSERT INTO public.profiles (user_id, full_name, phone, verification_status, created_at, updated_at)
    VALUES 
        ('22222222-2222-2222-2222-222222222222', 'Abebe Kebede', '+251911111111', 'verified', now(), now()),
        ('22222222-2222-2222-2222-222222222222', 'Sara Tadesse', '+251922222222', 'verified', now(), now()),
        ('22222222-2222-2222-2222-222222222222', 'Dawit Alemu', '+251933333333', 'verified', now(), now())
    ON CONFLICT (user_id) DO NOTHING;

    -- Insert Property Listings
    INSERT INTO public.listings (id, owner_id, listing_type, property_type, title, description, price, city, sub_city, location_detail, status, is_featured, details, created_at, updated_at)
    VALUES
        (listing1, '22222222-2222-2222-2222-222222222222', 'rent', 'apartment', 'Luxury 2BHK in Bole', 'Beautiful modern apartment in the heart of Bole.', 50000, 'Addis Ababa', 'Bole', 'Wolo Sefer', 'published', true, '{"bedrooms": 2, "bathrooms": 2, "area_sqm": 120, "furnished": true}', now(), now()),
        (listing2, '22222222-2222-2222-2222-222222222222', 'sale', 'house', 'Spacious Villa in CMC', 'Large family home with a big garden.', 25000000, 'Addis Ababa', 'CMC', 'Summit', 'published', true, '{"bedrooms": 4, "bathrooms": 3, "area_sqm": 500}', now(), now()),
        (listing3, '22222222-2222-2222-2222-222222222222', 'sale', 'commercial', 'Office Space in Kazanchis', 'Prime office location near UNECA.', 12000000, 'Addis Ababa', 'Kirkos', 'Kazanchis', 'published', false, '{"area_sqm": 250}', now(), now()),
        (listing6, '22222222-2222-2222-2222-222222222222', 'rent', 'apartment', 'Furnished Studio near Airport', 'Perfect for expats and frequent travelers.', 30000, 'Addis Ababa', 'Bole', 'Gerji', 'published', true, '{"bedrooms": 1, "bathrooms": 1, "area_sqm": 45, "furnished": true}', now(), now()),
        (listing7, '22222222-2222-2222-2222-222222222222', 'sale', 'land', '1000 Sqm plot in Ayat', 'Residential land ready for construction.', 15000000, 'Addis Ababa', 'Yeka', 'Ayat Zone 2', 'published', true, '{"area_sqm": 1000}', now(), now()),
        (listing8, '22222222-2222-2222-2222-222222222222', 'rent', 'commercial', 'Shop in Piassa', 'Ground floor shop in busy commercial area.', 60000, 'Addis Ababa', 'Arada', 'Piassa', 'published', false, '{"area_sqm": 60}', now(), now()),
        (listing9, '22222222-2222-2222-2222-222222222222', 'sale', 'apartment', 'Brand New 3BHK Apartment', 'Modern finishing, gym, and pool available.', 18000000, 'Addis Ababa', 'Lideta', 'Lideta Condominium', 'published', true, '{"bedrooms": 3, "bathrooms": 2, "area_sqm": 140, "furnished": false}', now(), now()),
        (listing10, '22222222-2222-2222-2222-222222222222', 'rent', 'villa', 'Diplomat Villa in Old Airport', 'High security, expansive garden, luxury build.', 150000, 'Addis Ababa', 'Nifas Silk-Lafto', 'Old Airport', 'published', true, '{"bedrooms": 5, "bathrooms": 4, "area_sqm": 800, "furnished": true}', now(), now());

    -- Insert Vehicle Listings
    INSERT INTO public.listings (id, owner_id, listing_type, property_type, title, description, price, city, sub_city, location_detail, status, is_featured, details, created_at, updated_at)
    VALUES
        (listing4, '22222222-2222-2222-2222-222222222222', 'sale', 'vehicle', 'Toyota Corolla 2020', 'Slightly used, excellent condition.', 3500000, 'Addis Ababa', 'Bole', 'Bole Medhanialem', 'published', true, '{"make": "Toyota", "model": "Corolla", "year": 2020, "mileage": 15000, "transmission": "Automatic"}', now(), now()),
        (listing5, '22222222-2222-2222-2222-222222222222', 'rent', 'vehicle', 'Hyundai Tucson 2022', 'Available for daily or monthly rental.', 5000, 'Addis Ababa', 'Yeka', 'Ayat', 'published', false, '{"make": "Hyundai", "model": "Tucson", "year": 2022, "transmission": "Automatic"}', now(), now()),
        (listing11, '22222222-2222-2222-2222-222222222222', 'sale', 'vehicle', 'Suzuki Swift 2018', 'Fuel efficient city car. Great for daily commute.', 1800000, 'Addis Ababa', 'Akaky Kaliti', 'Kaliti', 'published', false, '{"make": "Suzuki", "model": "Swift", "year": 2018, "mileage": 45000, "transmission": "Manual"}', now(), now()),
        (listing12, '22222222-2222-2222-2222-222222222222', 'rent', 'vehicle', 'Toyota Hilux Double Cab', '4x4 available for off-road and field trips.', 8000, 'Addis Ababa', 'Kirkos', 'Meskel Square', 'published', true, '{"make": "Toyota", "model": "Hilux", "year": 2021, "transmission": "Manual"}', now(), now()),
        (listing13, '22222222-2222-2222-2222-222222222222', 'sale', 'vehicle', 'Ford Ranger 2019', 'Well maintained pickup truck.', 4200000, 'Addis Ababa', 'Bole', 'Ruwanda', 'published', false, '{"make": "Ford", "model": "Ranger", "year": 2019, "mileage": 32000, "transmission": "Automatic"}', now(), now()),
        (listing14, '22222222-2222-2222-2222-222222222222', 'rent', 'vehicle', 'Nissan Patrol V8', 'Luxury SUV for VIP transport.', 12000, 'Addis Ababa', 'Bole', 'Atlas', 'published', true, '{"make": "Nissan", "model": "Patrol", "year": 2023, "transmission": "Automatic"}', now(), now()),
        (listing15, '22222222-2222-2222-2222-222222222222', 'sale', 'vehicle', 'Mitsubishi Pajero 2015', 'Classic SUV, good condition.', 2500000, 'Addis Ababa', 'Yeka', 'Megenagna', 'published', false, '{"make": "Mitsubishi", "model": "Pajero", "year": 2015, "mileage": 85000, "transmission": "Automatic"}', now(), now());

    -- Insert Listing Images
    INSERT INTO public.listing_images (listing_id, image_url, storage_path, is_primary, created_at)
    VALUES
        (listing1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', 'mock/listing1.jpg', true, now()),
        (listing2, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', 'mock/listing2.jpg', true, now()),
        (listing3, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', 'mock/listing3.jpg', true, now()),
        (listing4, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', 'mock/listing4.jpg', true, now()),
        (listing5, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80', 'mock/listing5.jpg', true, now()),
        (listing6, 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80', 'mock/listing6.jpg', true, now()),
        (listing7, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', 'mock/listing7.jpg', true, now()),
        (listing8, 'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=800&q=80', 'mock/listing8.jpg', true, now()),
        (listing9, 'https://images.unsplash.com/photo-1493809842364-78817bc723d7?auto=format&fit=crop&w=800&q=80', 'mock/listing9.jpg', true, now()),
        (listing10, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80', 'mock/listing10.jpg', true, now()),
        (listing11, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', 'mock/listing11.jpg', true, now()),
        (listing12, 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80', 'mock/listing12.jpg', true, now()),
        (listing13, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', 'mock/listing13.jpg', true, now()),
        (listing14, 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80', 'mock/listing14.jpg', true, now()),
        (listing15, 'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?auto=format&fit=crop&w=800&q=80', 'mock/listing15.jpg', true, now());

END $$;
