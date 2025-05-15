
import { HomeDataSection } from "@/components/home/HomeDataSection";
import { ProfileHeader } from "@/components/home/ProfileHeader";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingDialog } from "@/components/onboarding/OnboardingDialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

export default function Index() {
  const { session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

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

  const handlePreviewOTO = () => {
    navigate("/oto?subscription_success=true");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader profile={profile} />
      
      <div className="mb-6">
        <Button 
          variant="outline"
          className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
          onClick={handlePreviewOTO}
        >
          <Eye className="w-4 h-4" />
          Preview OTO Page
        </Button>
      </div>
      
      <HomeDataSection />
      {showOnboarding && <OnboardingDialog />}
    </div>
  );
}
