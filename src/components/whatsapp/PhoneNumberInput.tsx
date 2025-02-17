
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneNumberInput = ({ value, onChange }: PhoneNumberInputProps) => {
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow only numbers, plus sign, and spaces
    if (/^[\d\s+]*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone_number">WhatsApp Phone Number</Label>
      <Input
        id="phone_number"
        type="tel"
        placeholder="+1234567890"
        value={value}
        onChange={handlePhoneNumberChange}
        className="font-mono"
      />
      <p className="text-sm text-muted-foreground">
        Enter your number in international format (e.g. +1234567890)
      </p>
    </div>
  );
};
