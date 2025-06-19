
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Starting daily reminder generation...')

    // Get all users with WhatsApp preferences enabled for reminders
    const { data: preferences, error: prefsError } = await supabaseAdmin
      .from('whatsapp_preferences')
      .select(`
        user_id,
        phone_number,
        timezone,
        daily_reminder_time,
        profiles!inner(
          first_name,
          target_calories,
          target_protein,
          target_carbs,
          target_fat
        )
      `)
      .eq('reminders_enabled', true)

    if (prefsError) {
      console.error('Error fetching preferences:', prefsError)
      throw prefsError
    }

    console.log(`Found ${preferences?.length || 0} users with reminders enabled`)

    if (!preferences || preferences.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users with reminders enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let messagesCreated = 0

    for (const pref of preferences) {
      try {
        // Get yesterday's nutrition data for recap
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayDate = yesterday.toISOString().split('T')[0]

        const { data: yesterdayNutrition } = await supabaseAdmin
          .from('food_diary')
          .select('calories, protein, carbs, fat')
          .eq('user_id', pref.user_id)
          .eq('date', yesterdayDate)

        // Calculate yesterday's totals
        const yesterdayTotals = yesterdayNutrition?.reduce(
          (acc, entry) => ({
            calories: acc.calories + entry.calories,
            protein: acc.protein + entry.protein,
            carbs: acc.carbs + entry.carbs,
            fat: acc.fat + entry.fat
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        ) || { calories: 0, protein: 0, carbs: 0, fat: 0 }

        // Get encouraging messages array
        const encouragingMessages = [
          "You're doing amazing! Every healthy choice counts.",
          "Another day, another opportunity to nourish your body.",
          "You've got this! Consistency is your superpower.",
          "Ready to make today even better than yesterday?",
          "Your commitment to health is inspiring!",
          "Small steps daily lead to big transformations.",
          "You're building healthy habits that will last a lifetime."
        ]

        const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
        
        const profile = pref.profiles
        const firstName = profile?.first_name || 'there'

        // Generate recap message
        let recapText = ''
        if (yesterdayTotals.calories > 0) {
          recapText = `📊 Yesterday's recap:
🔥 ${Math.round(yesterdayTotals.calories)} calories
🥩 ${Math.round(yesterdayTotals.protein)}g protein
🍚 ${Math.round(yesterdayTotals.carbs)}g carbs
🥑 ${Math.round(yesterdayTotals.fat)}g fat

`
        } else {
          recapText = `📊 Yesterday: No nutrition data logged

`
        }

        const reminderContent = `${firstName}, ${randomMessage}

${recapText}🎯 Your nutrition goals for today:
🔥 Calories: ${profile?.target_calories || 2000}
🥩 Protein: ${profile?.target_protein || 150}g
🍚 Carbs: ${profile?.target_carbs || 200}g
🥑 Fat: ${profile?.target_fat || 70}g

⚖️ Remember to weigh yourself first thing this morning (before eating/drinking, after bathroom)

📸 All you need to do is snap a pic of everything you eat today

I'll take care of the rest!

💬 Tap the button below if you want to chat`

        // Create the reminder message
        const { error: messageError } = await supabaseAdmin
          .from('whatsapp_messages')
          .insert({
            user_id: pref.user_id,
            content: reminderContent,
            message_type: 'daily_reminder',
            status: 'pending'
          })

        if (messageError) {
          console.error(`Error creating message for user ${pref.user_id}:`, messageError)
          continue
        }

        messagesCreated++
        console.log(`Created daily reminder for ${firstName} (${pref.user_id})`)

      } catch (error) {
        console.error(`Error processing user ${pref.user_id}:`, error)
        continue
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Daily reminders processed',
        messagesCreated
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-daily-reminders function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
