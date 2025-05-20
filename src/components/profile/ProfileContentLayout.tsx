
import React from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { CustomTargets } from "@/components/profile/CustomTargets";
import { WhatsAppPreferences } from "@/components/whatsapp/WhatsAppPreferences";
import { PasswordChange } from "@/components/profile/PasswordChange";
import { ProfileReminder } from "@/components/profile/ProfileReminder";
import { StyleWrapper } from "@/components/profile/StyleWrapper";
import type { ProfileFormData } from "@/utils/profileCalculations";

interface ProfileContentLayoutProps {
  profile: ProfileFormData | null;
  showReminder: boolean;
  onSubmit: (data: ProfileFormData) => void;
  onChange: (data: Partial<ProfileFormData>) => void;
  isMobile: boolean;
}

export const ProfileContentLayout: React.FC<ProfileContentLayoutProps> = ({
  profile,
  showReminder,
  onSubmit,
  onChange,
  isMobile
}) => {
  if (isMobile) {
    return (
      <div className="space-y-6">
        <ProfileReminder show={showReminder} />
        
        <ProfileForm 
          onSubmit={onSubmit} 
          onChange={onChange}
          initialData={profile || undefined} 
        />
        
        <CustomTargets 
          initialData={{
            target_protein: profile?.target_protein,
            target_carbs: profile?.target_carbs,
            target_fat: profile?.target_fat,
          }}
        />
        
        <StyleWrapper>
          <WhatsAppPreferences />
        </StyleWrapper>
        
        <StyleWrapper>
          <PasswordChange />
        </StyleWrapper>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileForm 
        onSubmit={onSubmit} 
        onChange={onChange}
        initialData={profile || undefined} 
      />
      
      <CustomTargets 
        initialData={{
          target_protein: profile?.target_protein,
          target_carbs: profile?.target_carbs,
          target_fat: profile?.target_fat,
        }}
      />
      
      <StyleWrapper>
        <WhatsAppPreferences />
      </StyleWrapper>
      
      <StyleWrapper>
        <PasswordChange />
      </StyleWrapper>
    </div>
  );
};
