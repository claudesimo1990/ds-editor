import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@4.0.0";

interface Database {
  public: {
    Tables: {
      dde_email_queue: any;
    };
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY');

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const handler = async (req: Request): Promise<Response> => {
  console.log('Email queue processor started:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    if (!resend) {
      console.log('Resend API key not configured, skipping email sending');
      return new Response(JSON.stringify({
        success: true,
        message: 'Email sending disabled - no API key configured',
        processed: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get pending emails that are ready to be sent
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('dde_email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempts', 3) // Don't retry more than 3 times
      .order('created_at', { ascending: true })
      .limit(10); // Process in batches

    if (fetchError) {
      console.error('Error fetching pending emails:', fetchError);
      throw new Error(`Failed to fetch pending emails: ${fetchError.message}`);
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('No pending emails to process');
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending emails to process',
        processed: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log(`Processing ${pendingEmails.length} pending emails`);

    let processedCount = 0;
    let errorCount = 0;

    for (const email of pendingEmails) {
      try {
        console.log(`Sending email ${email.id} to ${email.email_address}`);

        // Mark as being processed
        await supabase
          .from('dde_email_queue')
          .update({
            attempts: email.attempts + 1,
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', email.id);

        // Send email via Resend
        const { data: emailResult, error: sendError } = await resend.emails.send({
          from: 'Gedenkportal <noreply@gedenkportal.de>',
          to: [email.email_address],
          subject: email.subject,
          html: email.html_content,
          text: email.text_content
        });

        if (sendError) {
          console.error(`Error sending email ${email.id}:`, sendError);
          
          // Mark as failed if max attempts reached
          const newStatus = email.attempts + 1 >= 3 ? 'failed' : 'pending';
          await supabase
            .from('dde_email_queue')
            .update({
              status: newStatus,
              error_message: sendError.message || 'Unknown error'
            })
            .eq('id', email.id);

          errorCount++;
          continue;
        }

        // Mark as sent
        await supabase
          .from('dde_email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', email.id);

        console.log(`Email ${email.id} sent successfully`);
        processedCount++;

      } catch (error: any) {
        console.error(`Error processing email ${email.id}:`, error);
        
        // Mark as failed if max attempts reached
        const newStatus = email.attempts + 1 >= 3 ? 'failed' : 'pending';
        await supabase
          .from('dde_email_queue')
          .update({
            status: newStatus,
            error_message: error.message || 'Unknown error'
          })
          .eq('id', email.id);

        errorCount++;
      }
    }

    console.log(`Email processing complete. Sent: ${processedCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({
      success: true,
      processed: processedCount,
      errors: errorCount,
      total: pendingEmails.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Error in process-email-queue function:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);