import { HomeDataSection } from "@/components/home/HomeDataSection";
import { ProfileHeader } from "@/components/home/ProfileHeader";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingDialog } from "@/components/onboarding/OnboardingDialog";

export default function Index() {
  const { session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function getProfile() {
      if (session?.user.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        setProfile(profile);
        setShowOnboarding(!profile?.has_seen_tutorial);
      }
    }

    getProfile();
  }, [session]);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader profile={profile} />
      <HomeDataSection />
      {showOnboarding && <OnboardingDialog />}
    </div>
  );
}