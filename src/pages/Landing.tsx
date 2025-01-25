import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { Pricing } from "@/components/blocks/pricing";
import { Header1 } from "@/components/ui/header";

const demoPlans = [
  {
    name: "BASIC",
    price: "0",
    yearlyPrice: "0",
    period: "per month",
    features: [
      "Track daily meals",
      "Basic nutrition insights",
      "Weight tracking",
      "Water intake tracking",
      "Community support"
    ],
    description: "Perfect for getting started with nutrition tracking",
    buttonText: "Start Free",
    href: "/auth",
    isPopular: false,
  },
  {
    name: "PRO",
    price: "9",
    yearlyPrice: "7",
    period: "per month",
    features: [
      "Everything in Basic",
      "AI meal analysis",
      "Custom meal plans",
      "Advanced analytics",
      "Priority support",
      "Progress reports",
      "Habit tracking"
    ],
    description: "Ideal for serious health and fitness enthusiasts",
    buttonText: "Get Started",
    href: "/auth",
    isPopular: true,
  },
  {
    name: "TEAMS",
    price: "19",
    yearlyPrice: "15",
    period: "per month",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Coach dashboard",
      "Client management",
      "Custom branding",
      "API access",
      "Dedicated support",
      "Training sessions"
    ],
    description: "Perfect for trainers and nutrition coaches",
    buttonText: "Contact Sales",
    href: "/contact",
    isPopular: false,
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { session, loading } = useSession();

  useEffect(() => {
    if (session && !loading) {
      navigate("/");
    }
  }, [session, loading, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header1 />
      <div className="pt-20">
        <Hero />
        <Pricing 
          plans={demoPlans}
          title="Choose Your Nutrition Journey"
          description="Start your path to better health with a plan that fits your needs.
All plans include core tracking features and regular updates."
        />
      </div>
    </div>
  );
};

export default Landing;