import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NotificationToggleProps {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  onEnabledChange: (checked: boolean) => void;
  time?: string;
  onTimeChange?: (time: string) => void;
  weeklyReportDay?: number;
  onWeeklyReportDayChange?: (day: string) => void;
  isWeeklyReport?: boolean;
}

const weekDays = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export const NotificationToggle = ({
  id,
  label,
  description,
  enabled,
  onEnabledChange,
  time,
  onTimeChange,
  weeklyReportDay,
  onWeeklyReportDayChange,
  isWeeklyReport = false,
}: NotificationToggleProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor={id}>{label}</Label>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <Switch
          id={id}
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          {isWeeklyReport ? (
            <>
              <Label htmlFor={`${id}_day`}>Report Day</Label>
              <Select
                value={weeklyReportDay?.toString()}
                onValueChange={onWeeklyReportDayChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <Label htmlFor={`${id}_time`}>Reminder Time</Label>
              <Input
                id={`${id}_time`}
                type="time"
                value={time}
                onChange={(e) => onTimeChange?.(e.target.value)}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}