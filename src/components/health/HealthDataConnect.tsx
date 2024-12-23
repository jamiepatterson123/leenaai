import { Phone, MessageCircle, Apple, Activity, Heart, Watch } from "lucide-react";
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

  const handleWhoopClick = () => {
    // This would be handled by Whoop API integration
    window.open("https://www.whoop.com/", "_blank");
  };

  const handleOuraClick = () => {
    // This would be handled by Oura Ring API integration
    window.open("https://ouraring.com/", "_blank");
  };

  const handleFitbitClick = () => {
    // This would be handled by Fitbit API integration
    window.open("https://www.fitbit.com/", "_blank");
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
              Sync your health and fitness data from Apple Health, including workouts, steps, and vital signs
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
            <CardTitle>Whoop</CardTitle>
            <CardDescription>
              Connect with Whoop to sync your recovery, strain, and sleep data for better training insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleWhoopClick}
              className="w-full flex items-center gap-2"
            >
              <Activity className="h-5 w-5" />
              Connect Whoop
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oura Ring</CardTitle>
            <CardDescription>
              Import your sleep quality, readiness, and activity data from your Oura Ring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleOuraClick}
              className="w-full flex items-center gap-2"
            >
              <Heart className="h-5 w-5" />
              Connect Oura Ring
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fitbit</CardTitle>
            <CardDescription>
              Sync your daily activity, heart rate, and sleep tracking data from your Fitbit device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleFitbitClick}
              className="w-full flex items-center gap-2"
            >
              <Watch className="h-5 w-5" />
              Connect Fitbit
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};