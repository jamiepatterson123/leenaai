
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

  // Create a Supabase client using the service role key to bypass RLS
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");

    console.log(`Checking trial access for user ${user.id}`);

    // Get current subscriber data
    const { data: subscriber, error: selectError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      throw new Error(`Error fetching subscriber: ${selectError.message}`);
    }

    // If no subscriber record exists yet, create one with 7-day trial
    if (!subscriber) {
      const now = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);
      
      await supabaseClient.from("subscribers").insert({
        user_id: user.id,
        email: user.email,
        trial_start_date: now.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        trial_active: true,
        subscribed: false,
        usage_count: 1,
        first_usage_time: now.toISOString(),
        last_usage_time: now.toISOString()
      });

      return new Response(
        JSON.stringify({
          has_access: true,
          trial_active: true,
          subscribed: false,
          trial_days_remaining: 7,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If user is subscribed, they have unlimited usage
    if (subscriber.subscribed) {
      console.log(`User ${user.id} is subscribed, unlimited access`);
      
      return new Response(
        JSON.stringify({
          has_access: true,
          trial_active: false,
          subscribed: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Check trial status
    const now = new Date();
    const trialEndDate = subscriber.trial_end_date ? new Date(subscriber.trial_end_date) : null;
    const isTrialActive = subscriber.trial_active && trialEndDate && now < trialEndDate;
    
    if (isTrialActive) {
      // Update usage count
      const newCount = subscriber.usage_count + 1;
      await supabaseClient
        .from("subscribers")
        .update({ 
          usage_count: newCount, 
          last_usage_time: now.toISOString(),
        })
        .eq("user_id", user.id);

      const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`Trial active for user ${user.id}, ${daysRemaining} days remaining`);

      return new Response(
        JSON.stringify({
          has_access: true,
          trial_active: true,
          subscribed: false,
          trial_days_remaining: daysRemaining,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      console.log(`Trial expired for user ${user.id}`);
      
      // Mark trial as inactive if it has expired
      if (subscriber.trial_active) {
        await supabaseClient
          .from("subscribers")
          .update({ trial_active: false })
          .eq("user_id", user.id);
      }
      
      return new Response(
        JSON.stringify({
          has_access: false,
          trial_active: false,
          subscribed: false,
          trial_expired: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error in increment-usage function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
