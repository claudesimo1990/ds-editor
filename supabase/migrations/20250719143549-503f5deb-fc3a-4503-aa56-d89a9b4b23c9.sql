-- Memorial pages table with all features from screenshot
CREATE TABLE public.dde_memorial_pages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deceased_first_name TEXT NOT NULL,
    deceased_last_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    death_date DATE NOT NULL,
    location TEXT,
    main_photo_url TEXT,
    memorial_text TEXT,
    life_story TEXT,
    is_published BOOLEAN DEFAULT false,
    is_moderated BOOLEAN DEFAULT false,
    moderation_status TEXT DEFAULT 'pending',
    visitor_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Memorial photos for "Leben in Bildern" section
CREATE TABLE public.dde_memorial_photos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    memorial_page_id UUID REFERENCES public.dde_memorial_pages(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    is_moderated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Condolence messages
CREATE TABLE public.dde_condolences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    memorial_page_id UUID REFERENCES public.dde_memorial_pages(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    message TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    is_moderated BOOLEAN DEFAULT false,
    moderation_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Memorial candles (extending existing dde_candles for memorial pages)
ALTER TABLE public.dde_candles 
ADD COLUMN memorial_page_id UUID REFERENCES public.dde_memorial_pages(id) ON DELETE CASCADE;

-- Memorial page visits tracking
CREATE TABLE public.dde_memorial_visits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    memorial_page_id UUID REFERENCES public.dde_memorial_pages(id) ON DELETE CASCADE,
    visitor_ip TEXT,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dde_memorial_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dde_memorial_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dde_condolences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dde_memorial_visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for memorial pages
CREATE POLICY "Users can create their own memorial pages" 
ON public.dde_memorial_pages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memorial pages" 
ON public.dde_memorial_pages FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memorial pages" 
ON public.dde_memorial_pages FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published memorial pages" 
ON public.dde_memorial_pages FOR SELECT 
USING (is_published = true AND is_moderated = true);

CREATE POLICY "Users can view their own memorial pages" 
ON public.dde_memorial_pages FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policies for memorial photos
CREATE POLICY "Users can manage photos of their memorial pages" 
ON public.dde_memorial_photos FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.dde_memorial_pages 
    WHERE id = memorial_page_id AND user_id = auth.uid()
));

CREATE POLICY "Anyone can view photos of published memorial pages" 
ON public.dde_memorial_photos FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.dde_memorial_pages 
    WHERE id = memorial_page_id AND is_published = true AND is_moderated = true
) AND is_moderated = true);

-- RLS Policies for condolences
CREATE POLICY "Anyone can create condolences" 
ON public.dde_condolences FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view public moderated condolences" 
ON public.dde_condolences FOR SELECT 
USING (is_public = true AND is_moderated = true);

CREATE POLICY "Memorial page owners can view all condolences" 
ON public.dde_condolences FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.dde_memorial_pages 
    WHERE id = memorial_page_id AND user_id = auth.uid()
));

-- RLS Policies for visits
CREATE POLICY "Anyone can record visits" 
ON public.dde_memorial_visits FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Memorial page owners can view visit stats" 
ON public.dde_memorial_visits FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.dde_memorial_pages 
    WHERE id = memorial_page_id AND user_id = auth.uid()
));

-- Update candles policy for memorial pages
CREATE POLICY "Anyone can light candles for memorial pages" 
ON public.dde_candles FOR INSERT 
WITH CHECK (memorial_page_id IS NOT NULL);

-- Function to update visitor count
CREATE OR REPLACE FUNCTION public.increment_memorial_visitor_count(page_id UUID, visitor_ip TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only count unique visits per IP per day
    IF NOT EXISTS (
        SELECT 1 FROM public.dde_memorial_visits 
        WHERE memorial_page_id = page_id 
        AND visitor_ip = increment_memorial_visitor_count.visitor_ip 
        AND DATE(visited_at) = CURRENT_DATE
    ) THEN
        INSERT INTO public.dde_memorial_visits (memorial_page_id, visitor_ip) 
        VALUES (page_id, visitor_ip);
        
        UPDATE public.dde_memorial_pages 
        SET visitor_count = visitor_count + 1 
        WHERE id = page_id;
    END IF;
END;
$$;

-- Function for AI moderation (placeholder)
CREATE OR REPLACE FUNCTION public.moderate_memorial_content(content_type TEXT, content_id UUID)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Placeholder for AI moderation logic
    -- For now, automatically approve content
    CASE content_type
        WHEN 'memorial_page' THEN
            UPDATE public.dde_memorial_pages 
            SET is_moderated = true, moderation_status = 'approved' 
            WHERE id = content_id;
        WHEN 'condolence' THEN
            UPDATE public.dde_condolences 
            SET is_moderated = true, moderation_status = 'approved' 
            WHERE id = content_id;
        WHEN 'photo' THEN
            UPDATE public.dde_memorial_photos 
            SET is_moderated = true 
            WHERE id = content_id;
    END CASE;
    
    RETURN true;
END;
$$;

-- Auto-moderate trigger for memorial pages
CREATE OR REPLACE FUNCTION public.auto_moderate_memorial_page()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM public.moderate_memorial_content('memorial_page', NEW.id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER auto_moderate_memorial_page_trigger
    AFTER INSERT ON public.dde_memorial_pages
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_moderate_memorial_page();

-- Auto-moderate trigger for condolences
CREATE OR REPLACE FUNCTION public.auto_moderate_condolence()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM public.moderate_memorial_content('condolence', NEW.id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER auto_moderate_condolence_trigger
    AFTER INSERT ON public.dde_condolences
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_moderate_condolence();