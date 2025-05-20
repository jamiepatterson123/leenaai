
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GlowEffect } from "@/components/ui/glow-effect";

interface ProfileReminderProps {
  show: boolean;
}

export const ProfileReminder: React.FC<ProfileReminderProps> = ({ show }) => {
  if (!show) return null;

  return (
    <Alert className="mb-6 relative overflow-hidden">
      <GlowEffect
        colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
        mode="flowHorizontal"
        blur="soft"
        duration={3}
      />
      <AlertDescription className="relative z-10 text-white font-bold text-center">
        IMPORTANT: complete your profile to get your custom nutrition targets
      </AlertDescription>
    </Alert>
  );
};
