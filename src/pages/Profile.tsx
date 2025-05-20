
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileData } from "@/hooks/use-profile-data";
import { useProfileCompletion } from "@/hooks/use-profile-completion";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileContentLayout } from "@/components/profile/ProfileContentLayout";

const Profile = () => {
  const { 
    loading, 
    profile, 
    profileSaved, 
    setProfileSaved,
    fetchProfile, 
    handleSubmit, 
    handleChange 
  } = useProfileData();
  
  const isMobile = useIsMobile();
  const location = useLocation();
  const { isProfileIncomplete } = useProfileCompletion(profile);

  // Check for yearly_success parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const yearlySuccess = searchParams.get('yearly_success');
    
    if (yearlySuccess === 'true') {
      toast.success("Thank you for upgrading to an annual plan!", {
        description: "Please complete your profile setup to get the most out of Leena.ai",
        duration: 6000,
      });
      
      // Clean up the URL by removing the parameter
      const newUrl = `${window.location.pathname}`;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location]);

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Only show the reminder if the profile is incomplete and it hasn't been saved yet on mobile
  const showReminder = isMobile ? (isProfileIncomplete() && !profileSaved) : isProfileIncomplete();

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader />
      <ProfileContentLayout
        profile={profile}
        showReminder={showReminder}
        onSubmit={handleSubmit}
        onChange={handleChange}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Profile;
