-- Add published_until column to memorial pages for consistency
ALTER TABLE public.dde_memorial_pages 
ADD COLUMN IF NOT EXISTS published_until TIMESTAMP WITH TIME ZONE;

-- Create notifications system
CREATE TABLE IF NOT EXISTS public.dde_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'approval_required', 'approved', 'rejected', 'expiring_soon', 'expired', 'payment_required'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email queue for reliable delivery
CREATE TABLE IF NOT EXISTS public.dde_email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_name TEXT,
  template_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email templates
CREATE TABLE IF NOT EXISTS public.dde_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT,
  variables JSONB DEFAULT '{}', -- Available template variables
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default email templates
INSERT INTO public.dde_email_templates (name, subject, html_template, text_template, variables) VALUES
('approval_required', 'Ihre {{type}} wartet auf Freigabe', 
'<h1>Freigabe erforderlich</h1><p>Ihre {{type}} für {{deceased_name}} wartet auf Freigabe durch unser Team.</p><p>Sie erhalten eine weitere E-Mail, sobald die Freigabe erfolgt ist.</p>',
'Freigabe erforderlich\n\nIhre {{type}} für {{deceased_name}} wartet auf Freigabe durch unser Team.\n\nSie erhalten eine weitere E-Mail, sobald die Freigabe erfolgt ist.',
'{"type": "string", "deceased_name": "string"}'
),
('approved', 'Ihre {{type}} wurde freigegeben', 
'<h1>Freigabe erteilt</h1><p>Ihre {{type}} für {{deceased_name}} wurde freigegeben und ist jetzt online verfügbar.</p><p><a href="{{view_url}}">Hier ansehen</a></p>',
'Freigabe erteilt\n\nIhre {{type}} für {{deceased_name}} wurde freigegeben und ist jetzt online verfügbar.\n\nHier ansehen: {{view_url}}',
'{"type": "string", "deceased_name": "string", "view_url": "string"}'
),
('expiring_soon', 'Ihre {{type}} läuft bald ab', 
'<h1>Verlängerung erforderlich</h1><p>Ihre {{type}} für {{deceased_name}} läuft am {{expiry_date}} ab.</p><p><a href="{{extend_url}}">Jetzt verlängern</a></p>',
'Verlängerung erforderlich\n\nIhre {{type}} für {{deceased_name}} läuft am {{expiry_date}} ab.\n\nJetzt verlängern: {{extend_url}}',
'{"type": "string", "deceased_name": "string", "expiry_date": "string", "extend_url": "string"}'
),
('expired', 'Ihre {{type}} ist abgelaufen', 
'<h1>Verlängerung möglich</h1><p>Ihre {{type}} für {{deceased_name}} ist am {{expiry_date}} abgelaufen.</p><p><a href="{{extend_url}}">Jetzt verlängern</a></p>',
'Verlängerung möglich\n\nIhre {{type}} für {{deceased_name}} ist am {{expiry_date}} abgelaufen.\n\nJetzt verlängern: {{extend_url}}',
'{"type": "string", "deceased_name": "string", "expiry_date": "string", "extend_url": "string"}'
) ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.dde_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dde_email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dde_email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.dde_notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.dde_notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" ON public.dde_notifications
FOR ALL USING (is_dde_admin(auth.uid()));

-- RLS Policies for email queue
CREATE POLICY "Admins can manage email queue" ON public.dde_email_queue
FOR ALL USING (is_dde_admin(auth.uid()));

-- RLS Policies for email templates
CREATE POLICY "Admins can manage email templates" ON public.dde_email_templates
FOR ALL USING (is_dde_admin(auth.uid()));

CREATE POLICY "Public can view active templates" ON public.dde_email_templates
FOR SELECT USING (is_active = true);

-- Create function to calculate expiry dates consistently
CREATE OR REPLACE FUNCTION public.calculate_expiry_date(
  published_date DATE,
  duration_days INTEGER
) RETURNS DATE AS $$
BEGIN
  IF duration_days IS NULL OR duration_days <= 0 THEN
    RETURN NULL; -- Unlimited duration
  END IF;
  
  RETURN published_date + INTERVAL '1 day' * duration_days;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to update published_until automatically
CREATE OR REPLACE FUNCTION public.update_published_until()
RETURNS TRIGGER AS $$
BEGIN
  -- For obituaries
  IF TG_TABLE_NAME = 'dde_obituaries' THEN
    IF NEW.is_published = true AND NEW.published_duration_days IS NOT NULL THEN
      NEW.published_until = (NEW.published_at::date + INTERVAL '1 day' * NEW.published_duration_days)::timestamp with time zone;
    END IF;
  END IF;
  
  -- For memorial pages
  IF TG_TABLE_NAME = 'dde_memorial_pages' THEN
    IF NEW.is_published = true AND NEW.publishing_duration_days IS NOT NULL THEN
      NEW.published_until = (NEW.published_at::date + INTERVAL '1 day' * NEW.publishing_duration_days)::timestamp with time zone;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update published_until
DROP TRIGGER IF EXISTS trigger_update_published_until_obituaries ON public.dde_obituaries;
CREATE TRIGGER trigger_update_published_until_obituaries
  BEFORE INSERT OR UPDATE ON public.dde_obituaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_published_until();

DROP TRIGGER IF EXISTS trigger_update_published_until_memorials ON public.dde_memorial_pages;
CREATE TRIGGER trigger_update_published_until_memorials
  BEFORE INSERT OR UPDATE ON public.dde_memorial_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_published_until();

-- Create function to enqueue notification emails
CREATE OR REPLACE FUNCTION public.enqueue_notification_email(
  p_user_id UUID,
  p_template_name TEXT,
  p_template_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  template_record RECORD;
  email_id UUID;
  user_email TEXT;
  rendered_subject TEXT;
  rendered_html TEXT;
  rendered_text TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = p_user_id;
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User email not found for user_id: %', p_user_id;
  END IF;
  
  -- Get template
  SELECT * INTO template_record FROM public.dde_email_templates 
  WHERE name = p_template_name AND is_active = true;
  
  IF template_record IS NULL THEN
    RAISE EXCEPTION 'Email template not found: %', p_template_name;
  END IF;
  
  -- Simple template rendering (replace {{variable}} with values)
  rendered_subject := template_record.subject;
  rendered_html := template_record.html_template;
  rendered_text := template_record.text_template;
  
  -- Replace variables in templates
  FOR key IN SELECT jsonb_object_keys(p_template_data) LOOP
    rendered_subject := replace(rendered_subject, '{{' || key || '}}', p_template_data->>key);
    rendered_html := replace(rendered_html, '{{' || key || '}}', p_template_data->>key);
    rendered_text := replace(rendered_text, '{{' || key || '}}', p_template_data->>key);
  END LOOP;
  
  -- Insert into email queue
  INSERT INTO public.dde_email_queue (
    user_id, email_address, subject, html_content, text_content,
    template_name, template_data
  ) VALUES (
    p_user_id, user_email, rendered_subject, rendered_html, rendered_text,
    p_template_name, p_template_data
  ) RETURNING id INTO email_id;
  
  RETURN email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;