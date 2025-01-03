import { ProfileRow } from "@/integrations/supabase/types/profiles";

interface ProfileHeaderProps {
  profile: ProfileRow | null;
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  if (!profile?.first_name) return null;
  
  return (
    <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 animate-fade-up">
      Hi {profile.first_name}
    </h1>
  );
};