import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const timezoneOffsets: { [key: string]: string } = {
  'Pacific/Midway': '(GMT-11)',
  'Pacific/Honolulu': '(GMT-10)',
  'America/Anchorage': '(GMT-9)',
  'America/Los_Angeles': '(GMT-8)',
  'America/Phoenix': '(GMT-7)',
  'America/Denver': '(GMT-7)',
  'America/Chicago': '(GMT-6)',
  'America/New_York': '(GMT-5)',
  'America/Halifax': '(GMT-4)',
  'America/St_Johns': '(GMT-3:30)',
  'America/Sao_Paulo': '(GMT-3)',
  'Atlantic/Cape_Verde': '(GMT-1)',
  'UTC': '(GMT+0)',
  'Europe/London': '(GMT+0)',
  'Europe/Berlin': '(GMT+1)',
  'Europe/Paris': '(GMT+1)',
  'Europe/Rome': '(GMT+1)',
  'Europe/Athens': '(GMT+2)',
  'Europe/Istanbul': '(GMT+3)',
  'Asia/Dubai': '(GMT+4)',
  'Asia/Kabul': '(GMT+4:30)',
  'Asia/Karachi': '(GMT+5)',
  'Asia/Kolkata': '(GMT+5:30)',
  'Asia/Kathmandu': '(GMT+5:45)',
  'Asia/Dhaka': '(GMT+6)',
  'Asia/Yangon': '(GMT+6:30)',
  'Asia/Bangkok': '(GMT+7)',
  'Asia/Singapore': '(GMT+8)',
  'Asia/Shanghai': '(GMT+8)',
  'Asia/Tokyo': '(GMT+9)',
  'Australia/Darwin': '(GMT+9:30)',
  'Australia/Sydney': '(GMT+10)',
  'Pacific/Noumea': '(GMT+11)',
  'Pacific/Auckland': '(GMT+12)',
  'Pacific/Kiritimati': '(GMT+14)'
}

// Sort timezones by their GMT offset
const timezones = Object.keys(timezoneOffsets).sort((a, b) => {
  const offsetA = parseInt(timezoneOffsets[a].match(/-?\d+/)?.[0] || '0')
  const offsetB = parseInt(timezoneOffsets[b].match(/-?\d+/)?.[0] || '0')
  return offsetA - offsetB
})

interface TimezoneSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const TimezoneSelector = ({ value, onValueChange }: TimezoneSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="timezone">Timezone</Label>
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent>
          {timezones.map((tz) => (
            <SelectItem key={tz} value={tz}>
              {tz.replace('_', ' ')} {timezoneOffsets[tz]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}