import { Phone, MessageCircle, Apple, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const HealthDataConnect = () => {
  const handleWhatsAppClick = () => {
    // Placeholder for future WhatsApp integration
    window.open("https://wa.me/1234567890", "_blank");
  };

  const handlePhoneClick = () => {
    // Placeholder for future phone call integration
    window.location.href = "tel:1234567890";
  };

  const handleAppleHealthClick = () => {
    // This would be handled by a native app integration
    window.open("https://www.apple.com/ios/health/", "_blank");
  };

  const handleGoogleFitClick = () => {
    // This would be handled by Google Fit API integration
    window.open("https://www.google.com/fit/", "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Integrations & Contact</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>
              Connect with Leena, your AI coach, via WhatsApp to receive personalized recommendations and reminders directly on your phone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleWhatsAppClick}
              className="w-full flex items-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Chat with Leena
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phone</CardTitle>
            <CardDescription>
              Get instant voice support from Leena. Receive nutrition advice and coaching reminders through phone calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handlePhoneClick}
              className="w-full flex items-center gap-2"
            >
              <Phone className="h-5 w-5" />
              Call Leena
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apple Health</CardTitle>
            <CardDescription>
              Sync your health and fitness data from Apple Health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleAppleHealthClick}
              className="w-full flex items-center gap-2"
            >
              <Apple className="h-5 w-5" />
              Connect Apple Health
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google Fit</CardTitle>
            <CardDescription>
              Connect with Google Fit to sync your activity and health data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGoogleFitClick}
              className="w-full flex items-center gap-2"
            >
              <Activity className="h-5 w-5" />
              Connect Google Fit
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};