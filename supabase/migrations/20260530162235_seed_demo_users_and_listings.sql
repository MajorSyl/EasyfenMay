/*
  # Seed demo users and listings for Easyfen

  Creates auth users, profiles, and sample listings so the feed
  is populated for preview. Uses fixed UUIDs so re-runs are idempotent.
*/

-- Insert demo users into auth.users
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, aud, role
)
VALUES
  (
    'a1b2c3d4-0001-0001-0001-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'aminata.sesay@easyfen.sl',
    crypt('Demo1234!', gen_salt('bf')),
    now(),
    '{"full_name":"Aminata Sesay"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    'a1b2c3d4-0002-0002-0002-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'ibrahim.conteh@easyfen.sl',
    crypt('Demo1234!', gen_salt('bf')),
    now(),
    '{"full_name":"Ibrahim Conteh"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    'a1b2c3d4-0003-0003-0003-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'fatmata.bangura@easyfen.sl',
    crypt('Demo1234!', gen_salt('bf')),
    now(),
    '{"full_name":"Fatmata Bangura"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- Upsert profiles
INSERT INTO public.profiles (id, full_name, phone_number, role, is_verified)
VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Aminata Sesay',   '232-77-234567', 'agent',            true),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Ibrahim Conteh',  '232-78-345678', 'service_provider', false),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Fatmata Bangura', '232-76-456789', 'agent',            true)
ON CONFLICT (id) DO NOTHING;

-- Update existing profile & listing
UPDATE public.profiles
SET full_name = 'Mohamed Kamara', phone_number = '232-76-123456', role = 'agent', is_verified = true
WHERE id = '73b4fd68-3d05-4248-95b4-6d73ec81ac73';

UPDATE public.listings SET
  title       = 'Modern 3-Bedroom Apartment in Goderich',
  description = 'Spacious and well-furnished 3-bedroom apartment in Goderich with ocean views. Modern kitchen, tiled bathrooms, 24-hour security. Perfect for families and professionals.',
  price       = 2500,
  images      = ARRAY[
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
    'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg',
    'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg'
  ],
  bedrooms    = 3,
  bathrooms   = 2,
  is_premium  = true,
  views_count = 342
WHERE id = '03f32f24-d218-445e-bbf4-abb0f13cad46';

-- Insert sample listings
INSERT INTO public.listings (
  user_id, listing_type, title, description, price, location_name,
  images, is_premium, views_count, inquiries_count, status,
  category, bedrooms, bathrooms, land_size, service_type, rate_type, years_experience
) VALUES

('a1b2c3d4-0001-0001-0001-000000000001','property',
 '4-Bedroom Executive House in Hill Station',
 'Elegant executive home in prestigious Hill Station with panoramic city views. Open-plan living, en-suite master bedroom, double garage, and lush garden.',
 85000,'Hill Station, Freetown',
 ARRAY['https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg','https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg'],
 true,218,12,'active','buy',4,3,null,null,null,null),

('a1b2c3d4-0001-0001-0001-000000000001','property',
 'Self-Contained Studio in Aberdeen',
 'Clean and modern studio apartment in Aberdeen, close to the beach. Fully furnished with AC, kitchen, and private bathroom. Bills inclusive.',
 800,'Aberdeen, Freetown',
 ARRAY['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg','https://images.pexels.com/photos/2029731/pexels-photo-2029731.jpeg'],
 false,97,5,'active','rent',1,1,null,null,null,null),

('a1b2c3d4-0003-0003-0003-000000000003','property',
 '2 Town Lots – Lumley Beach Road',
 'Prime land on Lumley Beach Road. 2 registered town lots with title deed. Ideal for guest house, restaurant or residential development.',
 45000,'Lumley, Freetown',
 ARRAY['https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg','https://images.pexels.com/photos/1559310/pexels-photo-1559310.jpeg'],
 false,143,8,'active','land',null,null,'2 town lots',null,null,null),

('a1b2c3d4-0003-0003-0003-000000000003','property',
 'Furnished 2-Bed Apartment, Wellington',
 'Affordable 2-bedroom apartment in Wellington with good road access and water supply. Tiled floors, security grills, and a small yard.',
 1200,'Wellington, Freetown',
 ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg','https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg'],
 false,64,3,'active','rent',2,1,null,null,null,null),

('73b4fd68-3d05-4248-95b4-6d73ec81ac73','property',
 'Commercial Building – Congo Cross',
 'Two-storey commercial building at the busy Congo Cross junction. Ground floor for shops/offices, upper floor residential. High footfall, great investment.',
 120000,'Congo Cross, Freetown',
 ARRAY['https://images.pexels.com/photos/2404843/pexels-photo-2404843.jpeg','https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
 true,289,17,'active','buy',null,null,null,null,null,null),

('a1b2c3d4-0001-0001-0001-000000000001','property',
 'Half Plot – Waterloo Road',
 'Affordable half plot of land along Waterloo Road. Suitable for residential building. Survey plan available.',
 8500,'Waterloo, Western Area Rural',
 ARRAY['https://images.pexels.com/photos/1086928/pexels-photo-1086928.jpeg'],
 false,55,2,'active','land',null,null,'half plot',null,null,null),

('a1b2c3d4-0002-0002-0002-000000000002','service',
 'Professional Plumbing & Pipe Fitting',
 'Experienced plumber offering installation, repair and maintenance of pipes, taps, water tanks and drainage. Residential and commercial jobs. Fast response.',
 150,'Freetown (All Areas)',
 ARRAY['https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg','https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg'],
 false,73,9,'active',null,null,null,null,'Plumbing','daily',7),

('a1b2c3d4-0002-0002-0002-000000000002','service',
 'Certified Electrician – Wiring & Solar',
 'Certified electrician specialising in house wiring, solar panel installation, generator connections and electrical fault diagnosis.',
 200,'Freetown & Environs',
 ARRAY['https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg','https://images.pexels.com/photos/3862365/pexels-photo-3862365.jpeg'],
 false,112,14,'active',null,null,null,null,'Electrical','daily',10),

('a1b2c3d4-0003-0003-0003-000000000003','service',
 'Interior Design & Home Decoration',
 'Creative interior designer offering full home decoration, furniture arrangement, wall art and painting consultations. Transform your space on any budget.',
 500,'Freetown',
 ARRAY['https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg','https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg'],
 true,187,22,'active',null,null,null,null,'Interior Design','project',5),

('a1b2c3d4-0001-0001-0001-000000000001','service',
 'Professional House Cleaning Service',
 'Thorough residential cleaning including deep cleaning, laundry, window washing and post-construction cleanup. Trustworthy team available weekdays and weekends.',
 100,'Freetown (All Areas)',
 ARRAY['https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg','https://images.pexels.com/photos/4108714/pexels-photo-4108714.jpeg'],
 false,48,6,'active',null,null,null,null,'Cleaning','daily',3);
