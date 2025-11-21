import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface Database {
  public: {
    Tables: {
      dde_notifications: any;
      dde_email_queue: any;
      dde_email_templates: any;
    };
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface NotificationRequest {
  userId: string;
  type: 'approval_required' | 'approved' | 'rejected' | 'expiring_soon' | 'expired' | 'payment_required';
  templateData: Record<string, any>;
  scheduleFor?: string; // ISO date string for delayed sending
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Notification request received:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { userId, type, templateData, scheduleFor }: NotificationRequest = await req.json();

    console.log('Processing notification:', { userId, type, templateData });

    if (!userId || !type || !templateData) {
      throw new Error('Missing required fields: userId, type, or templateData');
    }

    // Create in-app notification
    const { data: notification, error: notificationError } = await supabase
      .from('dde_notifications')
      .insert({
        user_id: userId,
        type,
        title: getNotificationTitle(type, templateData),
        message: getNotificationMessage(type, templateData),
        data: templateData,
        is_read: false,
        is_email_sent: false
      })
      .select()
      .single();

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw new Error(`Failed to create notification: ${notificationError.message}`);
    }

    console.log('Created notification:', notification.id);

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData.user?.email) {
      console.error('Error getting user email:', userError);
      throw new Error('Failed to get user email');
    }

    const userEmail = userData.user.email;
    console.log('User email found:', userEmail);

    // Get email template
    const templateName = getEmailTemplateName(type);
    const { data: template, error: templateError } = await supabase
      .from('dde_email_templates')
      .select('*')
      .eq('name', templateName)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Error getting email template:', templateError);
      throw new Error(`Email template not found: ${templateName}`);
    }

    console.log('Found email template:', template.name);

    // Render email content
    const renderedSubject = renderTemplate(template.subject, templateData);
    const renderedHtml = renderTemplate(template.html_template, templateData);
    const renderedText = renderTemplate(template.text_template || '', templateData);

    console.log('Rendered email subject:', renderedSubject);

    // Queue email for sending
    const scheduledFor = scheduleFor ? new Date(scheduleFor) : new Date();
    
    const { data: emailQueue, error: queueError } = await supabase
      .from('dde_email_queue')
      .insert({
        user_id: userId,
        email_address: userEmail,
        subject: renderedSubject,
        html_content: renderedHtml,
        text_content: renderedText,
        template_name: templateName,
        template_data: templateData,
        status: 'pending',
        scheduled_for: scheduledFor.toISOString()
      })
      .select()
      .single();

    if (queueError) {
      console.error('Error queuing email:', queueError);
      throw new Error(`Failed to queue email: ${queueError.message}`);
    }

    console.log('Email queued successfully:', emailQueue.id);

    // Mark notification as having email queued
    await supabase
      .from('dde_notifications')
      .update({ is_email_sent: true })
      .eq('id', notification.id);

    return new Response(JSON.stringify({
      success: true,
      notificationId: notification.id,
      emailQueueId: emailQueue.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Error in send-notifications function:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

function getNotificationTitle(type: string, data: Record<string, any>): string {
  switch (type) {
    case 'approval_required':
      return `${data.type} wartet auf Freigabe`;
    case 'approved':
      return `${data.type} wurde freigegeben`;
    case 'rejected':
      return `${data.type} wurde abgelehnt`;
    case 'expiring_soon':
      return `${data.type} läuft bald ab`;
    case 'expired':
      return `${data.type} ist abgelaufen`;
    case 'payment_required':
      return 'Zahlung erforderlich';
    default:
      return 'Benachrichtigung';
  }
}

function getNotificationMessage(type: string, data: Record<string, any>): string {
  switch (type) {
    case 'approval_required':
      return `Ihre ${data.type} für ${data.deceased_name} wartet auf Freigabe durch unser Team.`;
    case 'approved':
      return `Ihre ${data.type} für ${data.deceased_name} wurde freigegeben und ist jetzt online verfügbar.`;
    case 'rejected':
      return `Ihre ${data.type} für ${data.deceased_name} wurde abgelehnt. Bitte überarbeiten Sie den Inhalt.`;
    case 'expiring_soon':
      return `Ihre ${data.type} für ${data.deceased_name} läuft am ${data.expiry_date} ab.`;
    case 'expired':
      return `Ihre ${data.type} für ${data.deceased_name} ist am ${data.expiry_date} abgelaufen.`;
    case 'payment_required':
      return 'Eine Zahlung ist erforderlich, um fortzufahren.';
    default:
      return 'Sie haben eine neue Benachrichtigung erhalten.';
  }
}

function getEmailTemplateName(type: string): string {
  return type; // Template names match notification types
}

function renderTemplate(template: string, data: Record<string, any>): string {
  let rendered = template;
  
  // Replace {{variable}} with actual values
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
  }
  
  return rendered;
}

serve(handler);