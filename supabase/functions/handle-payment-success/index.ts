import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[HANDLE-PAYMENT-SUCCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      throw new Error("Missing sessionId");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Retrieved session", { sessionId, paymentStatus: session.payment_status });

    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    // Find the order
    const { data: order, error: orderError } = await supabaseService
      .from('dde_orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    logStep("Found order", { orderId: order.id });

    // Update order status
    await supabaseService
      .from('dde_orders')
      .update({ 
        payment_status: 'paid',
        completed_at: new Date().toISOString()
      })
      .eq('id', order.id);

    // Publish the obituary if metadata contains obituary data
    if (session.metadata?.obituaryData) {
      try {
        const obituaryData = JSON.parse(session.metadata.obituaryData);
        
        const { error: obituaryError } = await supabaseService
          .from('dde_obituaries')
          .upsert({
            ...obituaryData,
            payment_status: 'paid'
          });

        if (obituaryError) {
          logStep("Error publishing obituary", { error: obituaryError });
        } else {
          logStep("Obituary published successfully");
        }
      } catch (parseError) {
        logStep("Error parsing obituary data", { error: parseError });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      orderId: order.id,
      paymentStatus: 'paid'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in handle-payment-success", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});