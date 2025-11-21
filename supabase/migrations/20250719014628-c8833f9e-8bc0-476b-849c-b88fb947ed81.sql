-- Create table for obituaries with dde_ prefix
CREATE TABLE public.dde_obituaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Verstorbene Person
  deceased_first_name TEXT NOT NULL,
  deceased_last_name TEXT NOT NULL,
  deceased_additional_name TEXT,
  birth_date DATE NOT NULL,
  death_date DATE NOT NULL,
  
  -- Texte
  location_date TEXT,
  trauerspruch TEXT,
  introduction TEXT,
  main_text TEXT,
  side_texts TEXT,
  additional_texts TEXT,
  last_residence TEXT,
  
  -- Design-Optionen
  background_image TEXT DEFAULT 'memorial-bg-1.jpg',
  background_opacity DECIMAL DEFAULT 0.7,
  symbol_image TEXT,
  font_family TEXT DEFAULT 'memorial',
  frame_style TEXT DEFAULT 'none',
  color_theme TEXT DEFAULT 'light',
  
  -- Erweiterte Formatierung
  text_align TEXT DEFAULT 'center',
  line_height DECIMAL DEFAULT 1.6,
  letter_spacing DECIMAL DEFAULT 0,
  custom_color TEXT,
  
  -- Metadaten
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dde_obituaries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view published obituaries" 
ON public.dde_obituaries 
FOR SELECT 
USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own obituaries" 
ON public.dde_obituaries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own obituaries" 
ON public.dde_obituaries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own obituaries" 
ON public.dde_obituaries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dde_obituaries_updated_at
BEFORE UPDATE ON public.dde_obituaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_dde_obituaries_user_id ON public.dde_obituaries(user_id);
CREATE INDEX idx_dde_obituaries_published ON public.dde_obituaries(is_published);
CREATE INDEX idx_dde_obituaries_created_at ON public.dde_obituaries(created_at);