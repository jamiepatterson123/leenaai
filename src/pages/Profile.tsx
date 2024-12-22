import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { TargetsDisplay } from "@/components/profile/TargetsDisplay";
import { ProfileFormData, calculateTargets, TargetCalculations } from "@/utils/profileCalculations";

const Profile = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState<TargetCalculations | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setEmail(user.email || "");
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(); // Changed from .single() to .maybeSingle()

        if (profile) {
          handleFormChange(profile as ProfileFormData);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (data: Partial<ProfileFormData>) => {
    if (data.height_cm && data.weight_kg && data.age && data.activity_level && data.gender) {
      const newTargets = calculateTargets(data as ProfileFormData);
      setTargets(newTargets);
    }
  };

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...data
        });

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">Profile</h1>
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-6 w-6" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health & Fitness Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              onSubmit={handleSubmit}
              onChange={handleFormChange}
            />
          </CardContent>
        </Card>

        {targets && <TargetsDisplay targets={targets} />}
      </div>
    </div>
  );
};

export default Profile;