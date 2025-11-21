-- Add cause_of_death field to obituaries table and create demo data
ALTER TABLE dde_obituaries 
ADD COLUMN cause_of_death text CHECK (cause_of_death IN ('natuerlich', 'unnatuerlich')) DEFAULT NULL;

-- Create demo obituaries for existing users (without cause_of_death for now)
INSERT INTO dde_obituaries (
  user_id, deceased_first_name, deceased_last_name, birth_date, death_date, 
  gender, birth_place, death_place, relationship_status,
  main_text, trauerspruch, introduction, location_date, last_residence,
  family_members, life_events, background_image, font_family, color_theme,
  orientation, frame_style, photo_url,
  is_published, published_at, publishing_fee, payment_status, published_duration_days, views_count
) VALUES
-- User 1: Multiple obituaries
('e4d4d221-d897-41fb-9f90-55cca7579e14', 'Elisabeth', 'Müller', '1955-03-15', '2024-11-20', 
 'weiblich', 'Hamburg', 'Hamburg', 'verheiratet',
 'In liebevoller Erinnerung an eine wunderbare Ehefrau, Mutter und Großmutter.',
 'Die Erinnerung ist ein Fenster, durch das wir dich sehen können.',
 'Nach kurzer schwerer Krankheit ist unsere geliebte Elisabeth friedlich eingeschlafen.',
 'Hamburg, den 22. November 2024', 'Alsterchaussee 42, Hamburg',
 '[{"firstName": "Hans", "lastName": "Müller", "relationship": "ehemann"}, {"firstName": "Sarah", "lastName": "Müller", "relationship": "tochter"}]',
 '{}', 'memorial-bg-1.jpg', 'memorial', 'light', 'portrait', 'elegant',
 'https://picsum.photos/400/500?random=11',
 true, NOW() - INTERVAL '5 days', 149.00, 'completed', 30, 156),

('e4d4d221-d897-41fb-9f90-55cca7579e14', 'Wilhelm', 'Müller', '1925-08-10', '2024-10-15', 
 'männlich', 'Bremen', 'Hamburg', 'verwitwet',
 'Ein Leben voller Güte und Weisheit ist zu Ende gegangen.',
 'Was man tief in seinem Herzen besitzt, kann man nicht durch den Tod verlieren.',
 'Unser geliebter Vater und Großvater ist friedlich entschlafen.',
 'Hamburg, den 17. Oktober 2024', 'Seniorenheim Alstertal',
 '[{"firstName": "Hans", "lastName": "Müller", "relationship": "sohn"}]',
 '{}', 'memorial-bg-2.jpg', 'elegant', 'warm', 'portrait', 'double',
 'https://picsum.photos/400/500?random=12',
 true, NOW() - INTERVAL '10 days', 199.00, 'completed', 60, 234),

-- User 2: Single obituary
('d0e255bc-b68e-42f1-bfeb-9e4921b0bb8f', 'Robert', 'Schmidt', '1960-12-03', '2024-11-18', 
 'männlich', 'Berlin', 'Berlin', 'verheiratet',
 'Viel zu früh musstest du von uns gehen. Du bleibst unvergessen.',
 'Die Liebe hört niemals auf.',
 'Fassungslos nehmen wir Abschied von unserem geliebten Robert.',
 'Berlin, den 20. November 2024', 'Prenzlauer Berg',
 '[{"firstName": "Anna", "lastName": "Schmidt", "relationship": "ehefrau"}]',
 '{}', 'memorial-bg-3.jpg', 'serif', 'dark', 'portrait', 'simple',
 'https://picsum.photos/400/500?random=13',
 true, NOW() - INTERVAL '3 days', 299.00, 'completed', 90, 189),

-- User 3: Multiple obituaries  
('5070f12b-74cf-42c8-a33d-d8751f8f1ed2', 'Margarete', 'Weber', '1948-07-22', '2024-11-10', 
 'weiblich', 'München', 'München', 'verheiratet',
 'Eine liebevolle Mutter und Großmutter.',
 'Geliebt wirst du immer sein, vergessen niemals.',
 'Unsere geliebte Mutter ist friedlich eingeschlafen.',
 'München, den 12. November 2024', 'Maximilianstraße 15',
 '[{"firstName": "Karl", "lastName": "Weber", "relationship": "ehemann"}]',
 '{}', 'memorial-bg-1.jpg', 'memorial', 'light', 'portrait', 'elegant',
 'https://picsum.photos/400/500?random=14',
 true, NOW() - INTERVAL '11 days', 199.00, 'completed', 60, 178),

('5070f12b-74cf-42c8-a33d-d8751f8f1ed2', 'Heinrich', 'Weber', '1920-03-05', '2024-09-22', 
 'männlich', 'München', 'München', 'verheiratet',
 'Unser geliebter Großvater ist nach einem erfüllten Leben friedlich eingeschlafen.',
 'Ein erfülltes Leben hat seine Zeit, die Erinnerung ist ewig.',
 'Nach 104 Jahren ist unser Patriarch friedlich entschlafen.',
 'München, den 24. September 2024', 'Seniorenresidenz Schwabing',
 '[{"firstName": "Karl", "lastName": "Weber", "relationship": "sohn"}]',
 '{}', 'memorial-bg-2.jpg', 'elegant', 'warm', 'portrait', 'double',
 'https://picsum.photos/400/500?random=15',
 true, NOW() - INTERVAL '60 days', 149.00, 'completed', 90, 312),

-- User 4: Single obituary
('6263dcf0-0005-43db-b0b6-981d6ee66e8e', 'Johann', 'Wagner', '1952-01-08', '2024-10-25', 
 'männlich', 'Köln', 'Köln', 'verheiratet',
 'Ein liebevoller Vater und Großvater.',
 'Die schönsten Menschen bleiben unvergessen.',
 'Unser geliebter Familienvater ist verstorben.',
 'Köln, den 27. Oktober 2024', 'Bergisch Gladbach',
 '[{"firstName": "Maria", "lastName": "Wagner", "relationship": "ehefrau"}]',
 '{}', 'memorial-bg-3.jpg', 'serif', 'light', 'portrait', 'simple',
 'https://picsum.photos/400/500?random=16',
 true, NOW() - INTERVAL '27 days', 249.00, 'completed', 60, 203);

-- Now update with cause_of_death values
UPDATE dde_obituaries SET cause_of_death = 'natuerlich' WHERE deceased_first_name IN ('Elisabeth', 'Wilhelm', 'Margarete', 'Heinrich', 'Johann');
UPDATE dde_obituaries SET cause_of_death = 'unnatuerlich' WHERE deceased_first_name = 'Robert';