
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneNumberInput = ({ value, onChange }: PhoneNumberInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="phone_number">WhatsApp Phone Number</Label>
      <Input
        id="phone_number"
        type="text"
        inputMode="tel"
        placeholder="+1234567890"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono"
        autoComplete="tel"
      />
      <p className="text-sm text-muted-foreground">
        Enter your number in international format (e.g. +1234567890)
      </p>
    </div>
  );
};
