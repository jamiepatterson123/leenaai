import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { HomescreenTutorial } from "@/components/onboarding/HomescreenTutorial";
export default function DownloadApp() {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        {/* Header */}
        

        {/* Content */}
        <div className="p-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Add Leena.ai to Your Home Screen</h2>
            <p className="text-muted-foreground">
              Get the full app experience by adding Leena.ai to your phone's home screen. It's free and works just like a native app!
            </p>
          </div>

          {/* Tutorial Component */}
          <div className="bg-card rounded-lg border overflow-hidden">
            <HomescreenTutorial />
          </div>

          {/* Benefits */}
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-lg">Why add to home screen?</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Faster loading times</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Works offline for basic features</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Full-screen app experience</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Easy access from your home screen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}