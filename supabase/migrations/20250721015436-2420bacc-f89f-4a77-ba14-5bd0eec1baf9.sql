-- Create memorial pages for demo users
INSERT INTO dde_memorial_pages (
  user_id, deceased_first_name, deceased_last_name, birth_date, death_date, 
  gender, birth_place, death_place, relationship_status, cause_of_death,
  memorial_text, main_photo_url, location, 
  family_members, life_events,
  is_published, is_moderated, moderation_status, published_at, published_until,
  publishing_fee, payment_status, publishing_duration_days, visitor_count
) VALUES
-- Hans Müller Memorial
('11111111-1111-1111-1111-111111111111', 'Elisabeth', 'Müller', '1955-03-15', '2024-11-20', 
 'weiblich', 'Hamburg', 'Hamburg', 'verheiratet', 'natuerlich',
 'In liebevoller Erinnerung an eine wunderbare Ehefrau, Mutter und Großmutter.', 
 'https://picsum.photos/400/500?random=1', 'Hamburg',
 '[{"firstName": "Hans", "lastName": "Müller", "relationship": "ehemann"}, {"firstName": "Sarah", "lastName": "Müller", "relationship": "tochter"}, {"firstName": "Max", "lastName": "Müller", "relationship": "enkel"}]',
 '[{"title": "Studium der Germanistik", "date": "1975-09-01", "category": "ausbildung", "location": "Universität Hamburg", "description": "Abschluss mit Auszeichnung"}, {"title": "Hochzeit mit Hans", "date": "1978-06-15", "category": "familie", "location": "Hamburg", "description": "Der schönste Tag unseres Lebens"}]',
 true, true, 'approved', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days',
 149.00, 'completed', 30, 42),

-- Anna Schmidt Memorial
('22222222-2222-2222-2222-222222222222', 'Robert', 'Schmidt', '1960-12-03', '2024-11-18', 
 'männlich', 'Berlin', 'Berlin', 'verheiratet', 'unnatuerlich',
 'Viel zu früh musstest du von uns gehen. Du bleibst unvergessen in unseren Herzen.', 
 'https://picsum.photos/400/500?random=2', 'Berlin',
 '[{"firstName": "Anna", "lastName": "Schmidt", "relationship": "ehefrau"}, {"firstName": "Tim", "lastName": "Schmidt", "relationship": "sohn"}, {"firstName": "Lisa", "lastName": "Schmidt", "relationship": "tochter"}]',
 '[{"title": "Ingenieursstudium", "date": "1980-10-01", "category": "ausbildung", "location": "TU Berlin", "description": "Maschinenbau mit Bestnote"}, {"title": "Eigenes Ingenieurbüro", "date": "1995-03-01", "category": "arbeit", "location": "Berlin", "description": "Gründung der Schmidt Engineering GmbH"}]',
 true, true, 'approved', NOW() - INTERVAL '3 days', NOW() + INTERVAL '57 days',
 299.00, 'completed', 60, 28),

-- Karl Weber Memorial
('33333333-3333-3333-3333-333333333333', 'Margarete', 'Weber', '1948-07-22', '2024-11-10', 
 'weiblich', 'München', 'München', 'verheiratet', 'natuerlich',
 'Eine liebevolle Mutter und Großmutter, die uns allen so viel Liebe geschenkt hat.', 
 'https://picsum.photos/400/500?random=3', 'München',
 '[{"firstName": "Karl", "lastName": "Weber", "relationship": "ehemann"}, {"firstName": "Peter", "lastName": "Weber", "relationship": "sohn"}, {"firstName": "Maria", "lastName": "Weber", "relationship": "schwiegertochter"}]',
 '[{"title": "Ausbildung zur Krankenschwester", "date": "1968-09-01", "category": "ausbildung", "location": "München", "description": "Mit Leidenschaft Menschen geholfen"}, {"title": "Geburt von Peter", "date": "1975-04-12", "category": "familie", "location": "München", "description": "Unser größtes Glück"}]',
 true, true, 'approved', NOW() - INTERVAL '11 days', NOW() + INTERVAL '49 days',
 199.00, 'completed', 60, 35),

-- Maria Wagner Memorial  
('44444444-4444-4444-4444-444444444444', 'Johann', 'Wagner', '1952-01-08', '2024-10-25', 
 'männlich', 'Köln', 'Köln', 'verheiratet', 'natuerlich',
 'Ein liebevoller Vater und Großvater, der immer für seine Familie da war.', 
 'https://picsum.photos/400/500?random=4', 'Köln',
 '[{"firstName": "Maria", "lastName": "Wagner", "relationship": "ehefrau"}, {"firstName": "Michael", "lastName": "Wagner", "relationship": "sohn"}, {"firstName": "Sandra", "lastName": "Wagner", "relationship": "tochter"}]',
 '[{"title": "Meister im Handwerk", "date": "1975-08-01", "category": "arbeit", "location": "Köln", "description": "Stolzer Schreinermeister"}, {"title": "Goldene Hochzeit", "date": "2002-05-18", "category": "familie", "location": "Köln", "description": "50 Jahre gemeinsames Glück"}]',
 true, true, 'approved', NOW() - INTERVAL '27 days', NOW() + INTERVAL '33 days',
 249.00, 'completed', 60, 51),

-- Thomas Becker Memorial
('55555555-5555-5555-5555-555555555555', 'Helga', 'Becker', '1958-11-14', '2024-11-22', 
 'weiblich', 'Frankfurt', 'Frankfurt', 'verheiratet', 'natuerlich',
 'In stiller Trauer nehmen wir Abschied von unserer geliebten Helga.', 
 'https://picsum.photos/400/500?random=5', 'Frankfurt am Main',
 '[{"firstName": "Thomas", "lastName": "Becker", "relationship": "ehemann"}, {"firstName": "Julia", "lastName": "Becker", "relationship": "tochter"}, {"firstName": "David", "lastName": "Becker", "relationship": "sohn"}]',
 '[{"title": "Banklehre", "date": "1976-08-01", "category": "ausbildung", "location": "Frankfurt", "description": "Karriere in der Finanzbranche"}, {"title": "Abteilungsleiterin", "date": "1995-01-01", "category": "arbeit", "location": "Frankfurt", "description": "Führungsposition erreicht"}]',
 true, true, 'approved', NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days',
 149.00, 'completed', 30, 15);