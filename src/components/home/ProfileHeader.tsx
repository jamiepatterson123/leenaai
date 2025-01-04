import { ProfileRow } from "@/integrations/supabase/types/profiles";

interface ProfileHeaderProps {
  profile: ProfileRow | null;
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  if (!profile?.first_name) return null;
  
  return (
    <h1 className="text-3xl font-bold mb-6 text-primary">
      Welcome back, {profile.first_name}
    </h1>
  );
};