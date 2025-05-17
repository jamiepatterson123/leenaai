
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

    console.log(`Checking usage limits for user ${user.id}`);

    // Get current subscriber data
    const { data: subscriber, error: selectError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      throw new Error(`Error fetching subscriber: ${selectError.message}`);
    }

    // If no subscriber record exists yet, create one with usage_count = 1 and first_usage_time = now
    if (!subscriber) {
      const now = new Date();
      await supabaseClient.from("subscribers").insert({
        user_id: user.id,
        email: user.email,
        usage_count: 1,
        first_usage_time: now.toISOString(),
        last_usage_time: now.toISOString()
      });

      return new Response(
        JSON.stringify({
          usage_count: 1,
          daily_limit_reached: false,
          has_free_uses_remaining: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If user is subscribed, they have unlimited usage
    if (subscriber.subscribed) {
      console.log(`User ${user.id} is subscribed, no limits apply`);
      
      return new Response(
        JSON.stringify({
          usage_count: subscriber.usage_count,
          daily_limit_reached: false,
          has_free_uses_remaining: true,
          subscribed: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Check if this is within first 24 hours of usage
    const now = new Date();
    const firstUsageTime = subscriber.first_usage_time ? new Date(subscriber.first_usage_time) : null;
    const lastUsageTime = subscriber.last_usage_time ? new Date(subscriber.last_usage_time) : null;
    
    const isWithinFirst24Hours = firstUsageTime && 
      (now.getTime() - firstUsageTime.getTime() < 24 * 60 * 60 * 1000);
    
    let dailyLimitReached = false;
    let canUseService = false;

    if (isWithinFirst24Hours) {
      // Within first 24 hours: limit is 5 uses
      if (subscriber.usage_count < 5) {
        canUseService = true;
      } else {
        dailyLimitReached = true;
      }
    } else {
      // After first 24 hours: check if it's been 24 hours since last usage
      if (lastUsageTime) {
        const hoursSinceLastUsage = (now.getTime() - lastUsageTime.getTime()) / (60 * 60 * 1000);
        if (hoursSinceLastUsage >= 24) {
          canUseService = true;
        } else {
          dailyLimitReached = true;
        }
      } else {
        // No last usage time recorded, allow usage
        canUseService = true;
      }
    }

    if (canUseService) {
      // Update subscriber record with incremented usage count and last usage time
      const newCount = subscriber.usage_count + 1;
      
      await supabaseClient
        .from("subscribers")
        .update({ 
          usage_count: newCount, 
          last_usage_time: now.toISOString(),
          first_usage_time: firstUsageTime ? firstUsageTime.toISOString() : now.toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq("user_id", user.id);

      console.log(`Usage count incremented to ${newCount} for user ${user.id}`);

      return new Response(
        JSON.stringify({
          usage_count: newCount,
          daily_limit_reached: false,
          has_free_uses_remaining: true,
          within_first_24_hours: isWithinFirst24Hours,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      console.log(`Usage limit reached for user ${user.id}`);
      
      return new Response(
        JSON.stringify({
          usage_count: subscriber.usage_count,
          daily_limit_reached: true,
          has_free_uses_remaining: false,
          hours_until_next_use: lastUsageTime ? 
            24 - (now.getTime() - lastUsageTime.getTime()) / (60 * 60 * 1000) : 0,
          within_first_24_hours: isWithinFirst24Hours,
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
