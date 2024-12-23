import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all users with weight loss goals
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('fitness_goals', 'weight_loss')

    if (profilesError) throw profilesError

    for (const profile of profiles) {
      // Get weight entries from the last 2 weeks
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

      const { data: weightHistory } = await supabaseClient
        .from('profiles')
        .select('weight_kg, updated_at')
        .eq('user_id', profile.user_id)
        .gte('updated_at', twoWeeksAgo.toISOString())
        .order('updated_at', { ascending: true })

      if (weightHistory && weightHistory.length >= 2) {
        const oldestWeight = weightHistory[0].weight_kg
        const newestWeight = weightHistory[weightHistory.length - 1].weight_kg
        const weightDifference = newestWeight - oldestWeight

        // If weight hasn't decreased in 2 weeks and they have a weight loss goal
        if (weightDifference >= 0 && profile.target_calories) {
          // Reduce calories by 10%
          const newCalories = Math.round(profile.target_calories * 0.9)
          
          // Update target calories
          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({ 
              target_calories: newCalories,
              // Adjust macros proportionally
              target_protein: Math.round(profile.target_protein * 0.9),
              target_carbs: Math.round(profile.target_carbs * 0.9),
              target_fat: Math.round(profile.target_fat * 0.9)
            })
            .eq('user_id', profile.user_id)

          if (updateError) {
            console.error(`Error updating calories for user ${profile.user_id}:`, updateError)
          } else {
            console.log(`Updated calories for user ${profile.user_id} from ${profile.target_calories} to ${newCalories}`)
          }
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Calorie adjustments completed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})