-- Create demo users with realistic German names and data
WITH demo_users AS (
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) VALUES
    ('11111111-1111-1111-1111-111111111111', 'mueller.hans@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Hans", "last_name": "Müller"}'),
    ('22222222-2222-2222-2222-222222222222', 'schmidt.anna@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Anna", "last_name": "Schmidt"}'),
    ('33333333-3333-3333-3333-333333333333', 'weber.karl@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Karl", "last_name": "Weber"}'),
    ('44444444-4444-4444-4444-444444444444', 'wagner.maria@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Maria", "last_name": "Wagner"}'),
    ('55555555-5555-5555-5555-555555555555', 'becker.thomas@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Thomas", "last_name": "Becker"}'),
    ('66666666-6666-6666-6666-666666666666', 'schulze.petra@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Petra", "last_name": "Schulze"}'),
    ('77777777-7777-7777-7777-777777777777', 'hoffmann.michael@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Michael", "last_name": "Hoffmann"}'),
    ('88888888-8888-8888-8888-888888888888', 'richter.sabine@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Sabine", "last_name": "Richter"}'),
    ('99999999-9999-9999-9999-999999999999', 'neumann.frank@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Frank", "last_name": "Neumann"}'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'klein.ursula@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Ursula", "last_name": "Klein"}'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'wolf.werner@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Werner", "last_name": "Wolf"}'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'schroeder.gisela@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Gisela", "last_name": "Schroeder"}'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'krause.helmut@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Helmut", "last_name": "Krause"}'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'lehmann.ingrid@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Ingrid", "last_name": "Lehmann"}'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'koch.rainer@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Rainer", "last_name": "Koch"}'),
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'bauer.brigitte@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Brigitte", "last_name": "Bauer"}'),
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'fuchs.dieter@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Dieter", "last_name": "Fuchs"}'),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'braun.christa@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Christa", "last_name": "Braun"}'),
    ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'vogel.manfred@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Manfred", "last_name": "Vogel"}'),
    ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'winter.elfriede@demo.de', crypt('demo123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"first_name": "Elfriede", "last_name": "Winter"}')
  RETURNING id
),

-- Create user profiles
demo_profiles AS (
  INSERT INTO dde_user_profiles (
    user_id, first_name, last_name, email_verified, account_status, language, country, timezone
  ) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Hans', 'Müller', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('22222222-2222-2222-2222-222222222222', 'Anna', 'Schmidt', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('33333333-3333-3333-3333-333333333333', 'Karl', 'Weber', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('44444444-4444-4444-4444-444444444444', 'Maria', 'Wagner', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('55555555-5555-5555-5555-555555555555', 'Thomas', 'Becker', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('66666666-6666-6666-6666-666666666666', 'Petra', 'Schulze', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('77777777-7777-7777-7777-777777777777', 'Michael', 'Hoffmann', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('88888888-8888-8888-8888-888888888888', 'Sabine', 'Richter', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('99999999-9999-9999-9999-999999999999', 'Frank', 'Neumann', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ursula', 'Klein', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Werner', 'Wolf', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Gisela', 'Schroeder', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Helmut', 'Krause', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Ingrid', 'Lehmann', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Rainer', 'Koch', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Brigitte', 'Bauer', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Dieter', 'Fuchs', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Christa', 'Braun', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'Manfred', 'Vogel', true, 'active', 'de', 'Deutschland', 'Europe/Berlin'),
    ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'Elfriede', 'Winter', true, 'active', 'de', 'Deutschland', 'Europe/Berlin')
  RETURNING user_id
)

-- Create obituaries for demo users
INSERT INTO dde_obituaries (
  user_id, deceased_first_name, deceased_last_name, birth_date, death_date, 
  gender, birth_place, death_place, relationship_status, cause_of_death,
  main_text, trauerspruch, introduction, location_date, last_residence,
  family_members, life_events, background_image, font_family, color_theme,
  is_published, published_at, publishing_fee, payment_status, published_duration_days
) VALUES
-- Hans Müller - 2 obituaries
('11111111-1111-1111-1111-111111111111', 'Elisabeth', 'Müller', '1955-03-15', '2024-11-20', 'weiblich', 'Hamburg', 'Hamburg', 'verheiratet', 'natuerlich',
 'In liebevoller Erinnerung an eine wunderbare Ehefrau und Mutter.', 'Die Erinnerung ist ein Fenster, durch das wir dich sehen können, wann immer wir wollen.',
 'Nach kurzer schwerer Krankheit ist unsere geliebte Elisabeth friedlich eingeschlafen.', 'Hamburg, den 22. November 2024', 'Alsterchaussee 42, Hamburg',
 '[{"firstName": "Hans", "lastName": "Müller", "relationship": "ehemann"}, {"firstName": "Sarah", "lastName": "Müller", "relationship": "tochter"}]',
 '[{"title": "Studium der Germanistik", "date": "1975-09-01", "category": "ausbildung", "location": "Universität Hamburg"}]',
 'memorial-bg-1.jpg', 'memorial', 'light', true, NOW() - INTERVAL '5 days', 149.00, 'completed', 30),

('11111111-1111-1111-1111-111111111111', 'Wilhelm', 'Müller', '1925-08-10', '2024-10-15', 'männlich', 'Bremen', 'Hamburg', 'verwitwet', 'natuerlich',
 'Ein Leben voller Güte und Weisheit ist zu Ende gegangen.', 'Was man tief in seinem Herzen besitzt, kann man nicht durch den Tod verlieren.',
 'Unser geliebter Vater und Großvater ist nach einem erfüllten Leben friedlich entschlafen.', 'Hamburg, den 17. Oktober 2024', 'Seniorenheim Alstertal',
 '[{"firstName": "Hans", "lastName": "Müller", "relationship": "sohn"}, {"firstName": "Sarah", "lastName": "Müller", "relationship": "enkelin"}]',
 '[{"title": "Gründung der Tischlerei", "date": "1950-05-01", "category": "arbeit", "location": "Bremen"}]',
 'memorial-bg-2.jpg', 'elegant', 'warm', true, NOW() - INTERVAL '10 days', 199.00, 'completed', 60),

-- Anna Schmidt - 1 obituary
('22222222-2222-2222-2222-222222222222', 'Robert', 'Schmidt', '1960-12-03', '2024-11-18', 'männlich', 'Berlin', 'Berlin', 'verheiratet', 'unnatuerlich',
 'Viel zu früh musstest du von uns gehen. Du bleibst unvergessen.', 'Die Liebe hört niemals auf.',
 'Fassungslos und voller Trauer nehmen wir Abschied von unserem geliebten Robert.', 'Berlin, den 20. November 2024', 'Prenzlauer Berg',
 '[{"firstName": "Anna", "lastName": "Schmidt", "relationship": "ehefrau"}, {"firstName": "Tim", "lastName": "Schmidt", "relationship": "sohn"}]',
 '[{"title": "Ingenieursstudium", "date": "1980-10-01", "category": "ausbildung", "location": "TU Berlin"}]',
 'memorial-bg-3.jpg', 'serif', 'dark', true, NOW() - INTERVAL '3 days', 299.00, 'completed', 90);