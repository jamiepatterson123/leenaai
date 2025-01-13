import { Button } from "@/components/ui/button";
import { Camera, Utensils, LineChart, Medal, Scale, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Camera className="w-12 h-12 text-primary mb-4" />,
      title: "Snap & Track",
      description: "Take a photo of your food and let AI instantly analyze its nutritional content."
    },
    {
      icon: <Utensils className="w-12 h-12 text-primary mb-4" />,
      title: "Food Diary",
      description: "Keep a detailed log of your meals with automatic categorization and portion tracking."
    },
    {
      icon: <LineChart className="w-12 h-12 text-primary mb-4" />,
      title: "Nutrition Insights",
      description: "View detailed breakdowns of your macro and micronutrient intake over time."
    },
    {
      icon: <Medal className="w-12 h-12 text-primary mb-4" />,
      title: "Streak Tracking",
      description: "Stay motivated with daily streaks and progress tracking."
    },
    {
      icon: <Scale className="w-12 h-12 text-primary mb-4" />,
      title: "Weight Journey",
      description: "Track your weight changes and see your progress visualized."
    },
    {
      icon: <Brain className="w-12 h-12 text-primary mb-4" />,
      title: "AI-Powered",
      description: "Advanced machine learning for accurate food recognition and nutritional analysis."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Your AI Nutritionist
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Track your nutrition effortlessly with AI-powered food recognition. Just snap a photo and let technology do the rest.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="text-lg"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg"
            onClick={() => navigate("/learn")}
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Track Your Nutrition
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto bg-primary/10 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">
            Start Your Health Journey Today
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Join thousands of users who are already tracking their nutrition the smart way.
          </p>
          <Button
            size="lg"
            className="text-lg"
            onClick={() => navigate("/auth")}
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;