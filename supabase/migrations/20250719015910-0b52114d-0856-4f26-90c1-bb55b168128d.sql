-- Create table for candles
CREATE TABLE public.dde_candles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  obituary_id UUID REFERENCES public.dde_obituaries(id) ON DELETE CASCADE,
  lit_by_name TEXT NOT NULL,
  lit_by_email TEXT,
  message TEXT,
  duration_hours INTEGER DEFAULT 24,
  lit_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dde_candles ENABLE ROW LEVEL SECURITY;

-- Create policies for candles
CREATE POLICY "Anyone can view active candles" 
ON public.dde_candles 
FOR SELECT 
USING (is_active = true AND expires_at > now());

CREATE POLICY "Anyone can light candles" 
ON public.dde_candles 
FOR INSERT 
WITH CHECK (true);

-- Create function to set expiration date
CREATE OR REPLACE FUNCTION public.set_candle_expiration()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NEW.lit_at + (NEW.duration_hours || ' hours')::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic expiration calculation
CREATE TRIGGER set_candle_expiration_trigger
BEFORE INSERT ON public.dde_candles
FOR EACH ROW
EXECUTE FUNCTION public.set_candle_expiration();

-- Create indexes
CREATE INDEX idx_dde_candles_obituary_id ON public.dde_candles(obituary_id);
CREATE INDEX idx_dde_candles_active ON public.dde_candles(is_active, expires_at);

-- Insert sample obituaries
INSERT INTO public.dde_obituaries (
  id, deceased_first_name, deceased_last_name, birth_date, death_date, 
  photo_url, orientation, background_image, symbol_image, font_family, 
  frame_style, color_theme, location_date, trauerspruch, introduction, 
  main_text, side_texts, is_published, published_at
) VALUES 
(
  gen_random_uuid(),
  'Anna',
  'Grosch',
  '1950-05-15',
  '2024-01-12',
  '/src/assets/portraits/portrait-1.jpg',
  'landscape',
  '/src/assets/memorial-bg-1.jpg',
  'cross',
  'memorial',
  'simple',
  'light',
  'Bad Wiessee, den 15. Juli 2024',
  'In Liebe und Dankbarkeit nehmen wir Abschied von einer besonderen Frau',
  'Wir haben Abschied nehmen müssen von',
  'Nach langer, schwerer Krankheit ist unsere geliebte Mutter, Großmutter und Schwester friedlich eingeschlafen. Sie hat ihr Leben mit großer Güte und Stärke gelebt und wird in unseren Herzen weiterleben.',
  'In tiefer Trauer:\nFamilie Schmidt\nAngehörige und Freunde',
  true,
  now()
),
(
  gen_random_uuid(),
  'Heinrich',
  'Müller',
  '1942-11-03',
  '2024-01-08',
  '/src/assets/portraits/portrait-2.jpg',
  'portrait',
  '/src/assets/memorial-bg-2.jpg',
  'dove',
  'elegant',
  'double',
  'warm',
  'München, den 10. Juli 2024',
  'Ein Leben voller Hingabe und Liebe ist zu Ende gegangen',
  'Plötzlich und unerwartet verstarb unser lieber',
  'Über 40 Jahre war er ein treuer Mitarbeiter und geschätzter Kollege. Seine Hilfsbereitschaft und sein warmes Herz werden uns allen in Erinnerung bleiben.',
  'Es trauern:\nMaria Müller\nKinder und Enkelkinder\nFreunde und Wegbegleiter',
  true,
  now()
),
(
  gen_random_uuid(),
  'Elisabeth',
  'Weber',
  '1935-02-20',
  '2024-01-05',
  '/src/assets/portraits/portrait-3.jpg',
  'landscape',
  '/src/assets/memorial-bg-3.jpg',
  'flower',
  'memorial',
  'elegant',
  'light',
  'Rosenheim, den 8. Juli 2024',
  'Die Erinnerung ist ein Fenster, durch das wir Dich sehen können, wann immer wir wollen',
  'Wir nehmen Abschied von unserer geliebten',
  'Nach einem erfüllten Leben von 89 Jahren ist sie sanft eingeschlafen. Als liebevolle Mutter und Großmutter hat sie Generationen geprägt und wird unvergessen bleiben.',
  'In Liebe und Dankbarkeit:\nFamilie Weber\nVerwandte und Freunde',
  true,
  now()
),
(
  gen_random_uuid(),
  'Franz',
  'Bauer',
  '1948-08-12',
  '2024-01-03',
  '/src/assets/portraits/portrait-4.jpg',
  'portrait',
  '',
  'heart',
  'elegant',
  'none',
  'dark',
  'Garmisch-Partenkirchen, den 5. Juli 2024',
  'Was man tief in seinem Herzen besitzt, kann man nicht durch den Tod verlieren',
  'Viel zu früh mussten wir Abschied nehmen von unserem lieben',
  'Als Handwerker und Familienvater hat er sein Leben der Arbeit und seiner Familie gewidmet. Seine Güte und sein Humor werden uns immer begleiten.',
  'In stiller Trauer:\nIngrid Bauer\nTochter Sarah mit Familie\nSohn Michael mit Familie',
  true,
  now()
),
(
  gen_random_uuid(),
  'Margarete',
  'Huber',
  '1929-12-24',
  '2024-01-01',
  '/src/assets/portraits/portrait-5.jpg',
  'landscape',
  '/src/assets/memorial-bg-1.jpg',
  'angel',
  'memorial',
  'simple',
  'warm',
  'Innsbruck, den 3. Juli 2024',
  'Ihr Lächeln wird für immer in unseren Herzen leuchten',
  'Am Neujahrstag 2024 verstarb unsere geliebte',
  'Mit 94 Jahren durfte sie ein langes und erfülltes Leben führen. Als Lehrerin hat sie Generationen von Kindern geprägt und war eine Säule unserer Gemeinschaft.',
  'Es trauern:\nDie Familie Huber\nEhemalige Schüler und Kollegen\nFreunde aus nah und fern',
  true,
  now()
);