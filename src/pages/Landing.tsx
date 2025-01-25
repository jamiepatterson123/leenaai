import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { Pricing } from "@/components/blocks/pricing";
import { Header1 } from "@/components/ui/header";
import { Hero } from "@/components/ui/animated-hero";
import { Timeline } from "@/components/ui/timeline";
import { Camera, Utensils, LineChart } from "lucide-react";

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

const howToUseData = [
  {
    title: "Step 1",
    content: (
      <div>
        <p className="text-neutral-800 dark:text-neutral-200 text-base md:text-lg font-normal mb-4">
          Take a photo of your meal
        </p>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-8">
          Simply snap a picture of what you're eating. Our AI will analyze it instantly.
        </p>
        <div className="flex items-center justify-center p-8 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <Camera className="w-16 h-16 text-primary" />
        </div>
      </div>
    ),
  },
  {
    title: "Step 2",
    content: (
      <div>
        <p className="text-neutral-800 dark:text-neutral-200 text-base md:text-lg font-normal mb-4">
          Review nutrition details
        </p>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-8">
          Get accurate nutritional information from our USDA-certified database. Adjust portions if needed.
        </p>
        <div className="flex items-center justify-center p-8 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <Utensils className="w-16 h-16 text-primary" />
        </div>
      </div>
    ),
  },
  {
    title: "Step 3",
    content: (
      <div>
        <p className="text-neutral-800 dark:text-neutral-200 text-base md:text-lg font-normal mb-4">
          Track your progress
        </p>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base mb-8">
          Monitor your nutrition goals, track macros, and visualize your journey to better health.
        </p>
        <div className="flex items-center justify-center p-8 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <LineChart className="w-16 h-16 text-primary" />
        </div>
      </div>
    ),
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
        <div className="py-20">
          <Timeline data={howToUseData} />
        </div>
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