
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

    console.log(`Incrementing usage count for user ${user.id}`);

    // Get current subscriber data
    const { data: subscriber, error: selectError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      throw new Error(`Error fetching subscriber: ${selectError.message}`);
    }

    // If no subscriber record exists yet, create one with usage_count = 1
    if (!subscriber) {
      await supabaseClient.from("subscribers").insert({
        user_id: user.id,
        email: user.email,
        usage_count: 1,
      });

      return new Response(
        JSON.stringify({
          usage_count: 1,
          free_uses_remaining: 9,
          has_free_uses_remaining: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Only increment if not subscribed
    if (!subscriber.subscribed) {
      const newCount = subscriber.usage_count + 1;

      // Update subscriber record with incremented usage count
      await supabaseClient
        .from("subscribers")
        .update({ usage_count: newCount, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      console.log(`Usage count incremented to ${newCount} for user ${user.id}`);

      return new Response(
        JSON.stringify({
          usage_count: newCount,
          free_uses_remaining: Math.max(0, 10 - newCount),
          has_free_uses_remaining: newCount < 10,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      console.log(`User ${user.id} is subscribed, not incrementing usage`);
      
      return new Response(
        JSON.stringify({
          usage_count: subscriber.usage_count,
          free_uses_remaining: 0,
          has_free_uses_remaining: true, // Subscribed users can always use the app
          subscribed: true,
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
