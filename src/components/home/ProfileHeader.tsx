import { ProfileRow } from "@/integrations/supabase/types/profiles";

interface ProfileHeaderProps {
  profile: ProfileRow | null;
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  return (
    <h1 className="text-4xl font-bold text-center mb-8 text-primary">
      {profile?.first_name ? `Hi ${profile.first_name}, welcome to Leena` : "Welcome to Leena"}
    </h1>
  );
};