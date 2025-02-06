import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { NotificationToggle } from "./NotificationToggle"
import { PhoneNumberInput } from "./PhoneNumberInput"
import { TimezoneSelector } from "./TimezoneSelector"

interface WhatsAppPreferences {
  phone_number: string
  reminders_enabled: boolean
  weekly_report_enabled: boolean
  daily_reminder_time: string
  weekly_report_day: number
  timezone: string
}

export const WhatsAppPreferences = () => {
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState<WhatsAppPreferences>({
    phone_number: '',
    reminders_enabled: true,
    weekly_report_enabled: true,
    daily_reminder_time: '09:00',
    weekly_report_day: 0,
    timezone: 'UTC'
  })

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // First, let's get all preferences for this user
        const { data, error } = await supabase
          .from('whatsapp_preferences')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) throw error

        // Use the most recent preference if it exists
        if (data && data.length > 0) {
          const mostRecent = data[0]
          setPreferences({
            phone_number: mostRecent.phone_number,
            reminders_enabled: mostRecent.reminders_enabled ?? true,
            weekly_report_enabled: mostRecent.weekly_report_enabled ?? true,
            daily_reminder_time: mostRecent.daily_reminder_time || '09:00',
            weekly_report_day: mostRecent.weekly_report_day || 0,
            timezone: mostRecent.timezone || 'UTC'
          })

          // If we found multiple rows, clean up the duplicates
          if (data.length > 1) {
            console.log('Found multiple WhatsApp preferences, cleaning up...')
            const oldPrefs = data.slice(1)
            for (const pref of oldPrefs) {
              await supabase
                .from('whatsapp_preferences')
                .delete()
                .eq('id', pref.id)
            }
          }
        }
      } catch (error) {
        console.error('Error loading WhatsApp preferences:', error)
        toast.error('Failed to load WhatsApp preferences')
      }
    }

    loadPreferences()
  }, [])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('whatsapp_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        })

      if (error) throw error

      toast.success('WhatsApp preferences updated successfully')
    } catch (error) {
      console.error('Error saving WhatsApp preferences:', error)
      toast.error('Failed to save WhatsApp preferences')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp Notifications</CardTitle>
        <CardDescription>
          Receive nutrition reminders and weekly reports via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          <PhoneNumberInput
            value={preferences.phone_number}
            onChange={(value) => setPreferences(prev => ({ ...prev, phone_number: value }))}
          />

          <div className="space-y-4">
            <NotificationToggle
              id="reminders"
              label="Daily Reminders"
              description="Get reminded to log your meals"
              enabled={preferences.reminders_enabled}
              onEnabledChange={(checked) => setPreferences(prev => ({ ...prev, reminders_enabled: checked }))}
              time={preferences.daily_reminder_time}
              onTimeChange={(time) => setPreferences(prev => ({ ...prev, daily_reminder_time: time }))}
            />

            <NotificationToggle
              id="weekly_report"
              label="Weekly Report"
              description="Receive a summary of your nutrition progress"
              enabled={preferences.weekly_report_enabled}
              onEnabledChange={(checked) => setPreferences(prev => ({ ...prev, weekly_report_enabled: checked }))}
              isWeeklyReport={true}
              weeklyReportDay={preferences.weekly_report_day}
              onWeeklyReportDayChange={(day) => setPreferences(prev => ({ ...prev, weekly_report_day: parseInt(day) }))}
            />

            <TimezoneSelector
              value={preferences.timezone}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}