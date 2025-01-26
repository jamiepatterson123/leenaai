import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

interface NotificationToggleProps {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  onEnabledChange: (checked: boolean) => void;
  time: string;
  onTimeChange: (time: string) => void;
}

export const NotificationToggle = ({
  id,
  label,
  description,
  enabled,
  onEnabledChange,
  time,
  onTimeChange,
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
          <Label htmlFor={`${id}_time`}>Reminder Time</Label>
          <Input
            id={`${id}_time`}
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}