import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface Database {
  public: {
    Tables: {
      dde_obituaries: any;
      dde_memorial_pages: any;
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

interface ExpiringItem {
  id: string;
  user_id: string;
  deceased_first_name: string;
  deceased_last_name: string;
  published_until: string;
  type: 'obituary' | 'memorial';
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Starting expiry check:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    console.log('Checking for content expiring between:', now.toISOString(), 'and', threeDaysFromNow.toISOString());

    // Find obituaries expiring in the next 3 days
    const { data: expiringObituaries, error: obituariesError } = await supabase
      .from('dde_obituaries')
      .select('id, user_id, deceased_first_name, deceased_last_name, published_until')
      .eq('is_published', true)
      .eq('is_deleted', false)
      .gte('published_until', now.toISOString())
      .lte('published_until', threeDaysFromNow.toISOString());

    if (obituariesError) {
      console.error('Error fetching expiring obituaries:', obituariesError);
      throw new Error(`Failed to fetch expiring obituaries: ${obituariesError.message}`);
    }

    // Find memorial pages expiring in the next 3 days
    const { data: expiringMemorials, error: memorialsError } = await supabase
      .from('dde_memorial_pages')
      .select('id, user_id, deceased_first_name, deceased_last_name, published_until')
      .eq('is_published', true)
      .eq('is_deleted', false)
      .gte('published_until', now.toISOString())
      .lte('published_until', threeDaysFromNow.toISOString());

    if (memorialsError) {
      console.error('Error fetching expiring memorials:', memorialsError);
      throw new Error(`Failed to fetch expiring memorials: ${memorialsError.message}`);
    }

    console.log(`Found ${expiringObituaries?.length || 0} expiring obituaries and ${expiringMemorials?.length || 0} expiring memorials`);

    // Combine all expiring items
    const expiringItems: ExpiringItem[] = [
      ...(expiringObituaries || []).map(item => ({ ...item, type: 'obituary' as const })),
      ...(expiringMemorials || []).map(item => ({ ...item, type: 'memorial' as const }))
    ];

    let notificationsSent = 0;
    let expiredItemsHidden = 0;

    for (const item of expiringItems) {
      try {
        const expiryDate = new Date(item.published_until);
        const baseUrl = 'https://4f114946-9628-4d23-af5f-77ed0204bdc8.lovableproject.com'; // Update with your actual domain
        const viewUrl = `${baseUrl}/${item.type === 'obituary' ? 'traueranzeige' : 'gedenkseite'}/${item.id}`;
        const extendUrl = `${baseUrl}/user-bereich?extend=${item.type}&id=${item.id}`;
        
        // If already expired, hide the content
        if (expiryDate <= now) {
          console.log(`Hiding expired ${item.type}: ${item.id}`);
          
          const tableName = item.type === 'obituary' ? 'dde_obituaries' : 'dde_memorial_pages';
          const { error: hideError } = await supabase
            .from(tableName)
            .update({ is_published: false })
            .eq('id', item.id);

          if (hideError) {
            console.error(`Error hiding expired ${item.type}:`, hideError);
            continue;
          }

          // Send expired notification
          const notificationResponse = await supabase.functions.invoke('send-notifications', {
            body: {
              userId: item.user_id,
              type: 'expired',
              templateData: {
                type: item.type === 'obituary' ? 'Traueranzeige' : 'Gedenkseite',
                deceased_name: `${item.deceased_first_name} ${item.deceased_last_name}`,
                expiry_date: expiryDate.toLocaleDateString('de-DE'),
                view_url: viewUrl,
                extend_url: extendUrl
              }
            }
          });

          if (notificationResponse.error) {
            console.error('Error sending expired notification:', notificationResponse.error);
          } else {
            console.log(`Sent expired notification for ${item.type}: ${item.id}`);
            notificationsSent++;
          }

          expiredItemsHidden++;

        } else if (expiryDate <= oneDayFromNow) {
          // Send expiring soon notification for items expiring within 24 hours
          console.log(`Sending expiring soon notification for ${item.type}: ${item.id}`);
          
          const notificationResponse = await supabase.functions.invoke('send-notifications', {
            body: {
              userId: item.user_id,
              type: 'expiring_soon',
              templateData: {
                type: item.type === 'obituary' ? 'Traueranzeige' : 'Gedenkseite',
                deceased_name: `${item.deceased_first_name} ${item.deceased_last_name}`,
                expiry_date: expiryDate.toLocaleDateString('de-DE'),
                view_url: viewUrl,
                extend_url: extendUrl
              }
            }
          });

          if (notificationResponse.error) {
            console.error('Error sending expiring soon notification:', notificationResponse.error);
          } else {
            console.log(`Sent expiring soon notification for ${item.type}: ${item.id}`);
            notificationsSent++;
          }
        }

      } catch (error: any) {
        console.error(`Error processing expiring item ${item.id}:`, error);
      }
    }

    console.log(`Expiry check complete. Notifications sent: ${notificationsSent}, Items hidden: ${expiredItemsHidden}`);

    return new Response(JSON.stringify({
      success: true,
      totalItemsChecked: expiringItems.length,
      notificationsSent,
      expiredItemsHidden,
      summary: {
        expiringObituaries: expiringObituaries?.length || 0,
        expiringMemorials: expiringMemorials?.length || 0
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Error in check-expiring-content function:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);