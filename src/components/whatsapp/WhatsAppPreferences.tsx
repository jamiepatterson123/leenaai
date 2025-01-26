import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

interface WhatsAppPreferences {
  phone_number: string
  reminders_enabled: boolean
  weekly_report_enabled: boolean
  daily_reminder_time: string
  weekly_report_time: string
  timezone: string
}

export const WhatsAppPreferences = () => {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, watch } = useForm<WhatsAppPreferences>()
  const remindersEnabled = watch('reminders_enabled')
  const weeklyReportEnabled = watch('weekly_report_enabled')

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('whatsapp_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setValue('phone_number', data.phone_number)
          setValue('reminders_enabled', data.reminders_enabled)
          setValue('weekly_report_enabled', data.weekly_report_enabled)
          setValue('daily_reminder_time', data.daily_reminder_time || '09:00')
          setValue('weekly_report_time', data.weekly_report_time || '10:00')
          setValue('timezone', data.timezone || 'UTC')
        }
      } catch (error) {
        console.error('Error loading WhatsApp preferences:', error)
        toast.error('Failed to load WhatsApp preferences')
      }
    }

    loadPreferences()
  }, [setValue])

  const onSubmit = async (data: WhatsAppPreferences) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('whatsapp_preferences')
        .upsert({
          user_id: user.id,
          phone_number: data.phone_number,
          reminders_enabled: data.reminders_enabled,
          weekly_report_enabled: data.weekly_report_enabled,
          daily_reminder_time: data.daily_reminder_time,
          weekly_report_time: data.weekly_report_time,
          timezone: data.timezone
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

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp Notifications</CardTitle>
        <CardDescription>
          Receive nutrition reminders and weekly reports via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone_number">WhatsApp Phone Number</Label>
            <Input
              id="phone_number"
              placeholder="+1234567890"
              {...register('phone_number')}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminders">Daily Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded to log your meals
                </p>
              </div>
              <Switch
                id="reminders"
                checked={remindersEnabled}
                onCheckedChange={(checked) => setValue('reminders_enabled', checked)}
              />
            </div>

            {remindersEnabled && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="daily_reminder_time">Reminder Time</Label>
                <Input
                  id="daily_reminder_time"
                  type="time"
                  {...register('daily_reminder_time')}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly_report">Weekly Report</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a summary of your nutrition progress
                </p>
              </div>
              <Switch
                id="weekly_report"
                checked={weeklyReportEnabled}
                onCheckedChange={(checked) => setValue('weekly_report_enabled', checked)}
              />
            </div>

            {weeklyReportEnabled && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="weekly_report_time">Report Time</Label>
                <Input
                  id="weekly_report_time"
                  type="time"
                  {...register('weekly_report_time')}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                onValueChange={(value) => setValue('timezone', value)} 
                defaultValue="UTC"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}