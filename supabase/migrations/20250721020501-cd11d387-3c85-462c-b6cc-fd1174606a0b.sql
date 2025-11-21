-- Create demo memorial pages and obituaries using existing user IDs
INSERT INTO dde_memorial_pages (
  user_id, deceased_first_name, deceased_last_name, birth_date, death_date, 
  gender, birth_place, death_place, relationship_status, cause_of_death,
  memorial_text, main_photo_url, location, 
  family_members, life_events,
  is_published, is_moderated, moderation_status, published_at, published_until,
  publishing_fee, payment_status, publishing_duration_days, visitor_count
) VALUES
-- User 1: Multiple memorial pages
('e4d4d221-d897-41fb-9f90-55cca7579e14', 'Elisabeth', 'Müller', '1955-03-15', '2024-11-20', 
 'weiblich', 'Hamburg', 'Hamburg', 'verheiratet', 'natuerlich',
 'In liebevoller Erinnerung an eine wunderbare Ehefrau, Mutter und Großmutter.', 
 'https://picsum.photos/400/500?random=1', 'Hamburg',
 '[{"firstName": "Hans", "lastName": "Müller", "relationship": "ehemann"}, {"firstName": "Sarah", "lastName": "Müller", "relationship": "tochter"}]',
 '[{"title": "Studium der Germanistik", "date": "1975-09-01", "category": "ausbildung", "location": "Universität Hamburg", "description": "Abschluss mit Auszeichnung"}]',
 true, true, 'approved', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days',
 149.00, 'completed', 30, 42),

('e4d4d221-d897-41fb-9f90-55cca7579e14', 'Wilhelm', 'Müller', '1925-08-10', '2024-10-15', 
 'männlich', 'Bremen', 'Hamburg', 'verwitwet', 'natuerlich',
 'Ein Leben voller Güte und Weisheit ist zu Ende gegangen.', 
 'https://picsum.photos/400/500?random=2', 'Hamburg',
 '[{"firstName": "Hans", "lastName": "Müller", "relationship": "sohn"}, {"firstName": "Sarah", "lastName": "Müller", "relationship": "enkelin"}]',
 '[{"title": "Gründung der Tischlerei", "date": "1950-05-01", "category": "arbeit", "location": "Bremen", "description": "Erfolgreicher Handwerker"}]',
 true, true, 'approved', NOW() - INTERVAL '10 days', NOW() + INTERVAL '50 days',
 199.00, 'completed', 60, 38),

-- User 2: Single memorial page
('d0e255bc-b68e-42f1-bfeb-9e4921b0bb8f', 'Robert', 'Schmidt', '1960-12-03', '2024-11-18', 
 'männlich', 'Berlin', 'Berlin', 'verheiratet', 'unnatuerlich',
 'Viel zu früh musstest du von uns gehen. Du bleibst unvergessen.', 
 'https://picsum.photos/400/500?random=3', 'Berlin',
 '[{"firstName": "Anna", "lastName": "Schmidt", "relationship": "ehefrau"}, {"firstName": "Tim", "lastName": "Schmidt", "relationship": "sohn"}]',
 '[{"title": "Ingenieursstudium", "date": "1980-10-01", "category": "ausbildung", "location": "TU Berlin", "description": "Maschinenbau"}]',
 true, true, 'approved', NOW() - INTERVAL '3 days', NOW() + INTERVAL '57 days',
 299.00, 'completed', 60, 28),

-- User 3: Multiple memorial pages  
('5070f12b-74cf-42c8-a33d-d8751f8f1ed2', 'Margarete', 'Weber', '1948-07-22', '2024-11-10', 
 'weiblich', 'München', 'München', 'verheiratet', 'natuerlich',
 'Eine liebevolle Mutter und Großmutter.', 
 'https://picsum.photos/400/500?random=4', 'München',
 '[{"firstName": "Karl", "lastName": "Weber", "relationship": "ehemann"}]',
 '[{"title": "Krankenschwester", "date": "1968-09-01", "category": "ausbildung", "location": "München"}]',
 true, true, 'approved', NOW() - INTERVAL '11 days', NOW() + INTERVAL '49 days',
 199.00, 'completed', 60, 35),

('5070f12b-74cf-42c8-a33d-d8751f8f1ed2', 'Heinrich', 'Weber', '1920-03-05', '2024-09-22', 
 'männlich', 'München', 'München', 'verheiratet', 'natuerlich',
 'Unser geliebter Großvater ist friedlich eingeschlafen.', 
 'https://picsum.photos/400/500?random=5', 'München',
 '[{"firstName": "Karl", "lastName": "Weber", "relationship": "sohn"}, {"firstName": "Margarete", "lastName": "Weber", "relationship": "schwiegertochter"}]',
 '[{"title": "Bäckermeister", "date": "1945-06-01", "category": "arbeit", "location": "München"}]',
 true, true, 'approved', NOW() - INTERVAL '60 days', NOW() + INTERVAL '30 days',
 149.00, 'completed', 90, 67),

-- User 4: Single memorial
('6263dcf0-0005-43db-b0b6-981d6ee66e8e', 'Johann', 'Wagner', '1952-01-08', '2024-10-25', 
 'männlich', 'Köln', 'Köln', 'verheiratet', 'natuerlich',
 'Ein liebevoller Vater und Großvater.', 
 'https://picsum.photos/400/500?random=6', 'Köln',
 '[{"firstName": "Maria", "lastName": "Wagner", "relationship": "ehefrau"}]',
 '[{"title": "Schreinermeister", "date": "1975-08-01", "category": "arbeit", "location": "Köln"}]',
 true, true, 'approved', NOW() - INTERVAL '27 days', NOW() + INTERVAL '33 days',
 249.00, 'completed', 60, 51);