import { Switch } from "@/components/ui/switch";

export interface NotificationToggleProps {
  label: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

export const NotificationToggle = ({ label, enabled, onChange }: NotificationToggleProps) => {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
      />
    </div>
  );
};