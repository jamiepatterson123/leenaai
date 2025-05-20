
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);

    const user = userData.user;
    if (!user) throw new Error("User not found");

    // Get user subscription status
    const { data: subscriber, error: subError } = await supabaseClient
      .from("subscribers")
      .select("subscribed, credits, usage_count, first_usage_time")
      .eq("user_id", user.id)
      .single();

    if (subError && subError.code !== "PGRST116") {
      throw new Error(`Error fetching subscriber: ${subError.message}`);
    }

    // Premium users don't consume credits
    if (subscriber?.subscribed) {
      // Just increment usage count for tracking
      await supabaseClient
        .from("subscribers")
        .update({ 
          usage_count: (subscriber.usage_count || 0) + 1,
          last_usage_time: new Date().toISOString()
        })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          credits_remaining: "unlimited",
          is_premium: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Free users consume credits
    const currentCredits = subscriber?.credits || 0;
    
    // Check if user has any credits left
    if (currentCredits <= 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          credits_remaining: 0,
          error: "No credits remaining"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    // Consume one credit
    const { error: updateError } = await supabaseClient
      .from("subscribers")
      .update({ 
        credits: currentCredits - 1,
        usage_count: (subscriber?.usage_count || 0) + 1,
        first_usage_time: subscriber?.first_usage_time || new Date().toISOString(),
        last_usage_time: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (updateError) throw new Error(`Error updating subscriber: ${updateError.message}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        credits_remaining: currentCredits - 1,
        is_premium: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
