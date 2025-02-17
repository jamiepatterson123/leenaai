
import React, { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneNumberInput = ({ value, onChange }: PhoneNumberInputProps) => {
  const [localValue, setLocalValue] = useState(value);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="space-y-2">
      <Label htmlFor="phone_number">WhatsApp Phone Number</Label>
      <Input
        id="phone_number"
        type="text"
        inputMode="tel"
        placeholder="+1234567890"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onChange(localValue)}
        className="font-mono"
        autoComplete="tel"
      />
      <p className="text-sm text-muted-foreground">
        Enter your number in international format (e.g. +1234567890)
      </p>
    </div>
  );
};
