import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { Pricing } from "@/components/blocks/pricing";
import { Header1 } from "@/components/ui/header";
import { Hero } from "@/components/ui/animated-hero";
import { Timeline } from "@/components/ui/timeline";
import { Camera, Utensils, LineChart } from "lucide-react";
import { Footerdemo } from "@/components/ui/footer-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const faqItems = [
  {
    id: "1",
    title: "How does Leena.ai analyze my food?",
    collapsibles: [
      {
        title: "What technology is used?",
        content: "We use advanced AI and machine learning to analyze photos of your food, providing accurate nutritional information instantly.",
      },
      {
        title: "How accurate is it?",
        content: "Our system is highly accurate and uses the USDA database for nutritional information verification.",
      },
    ],
  },
  {
    id: "2",
    title: "What kind of nutrition tracking features are included?",
    collapsibles: [
      {
        title: "What can I track?",
        content: "Track calories, macronutrients (protein, carbs, fat), water intake, and weight progress.",
      },
      {
        title: "Can I set custom goals?",
        content: "Yes, you can set and adjust your nutrition targets based on your specific fitness goals.",
      },
    ],
  },
  {
    id: "3",
    title: "Is Leena.ai suitable for athletes?",
    collapsibles: [
      {
        title: "What features are specific to athletes?",
        content: "We offer advanced performance tracking, macro planning, and integration with fitness devices.",
        open: true,
      },
      {
        title: "Can coaches use it?",
        content: "Yes, our Teams plan includes features specifically designed for coaches and trainers.",
      },
    ],
  },
  {
    id: "4",
    title: "How does the app help with weight management?",
    collapsibles: [
      {
        title: "What tracking tools are available?",
        content: "Track your weight progress, body measurements, and see detailed progress charts.",
      },
      {
        title: "Are there meal recommendations?",
        content: "Yes, we provide personalized nutrition recommendations based on your goals and preferences.",
      },
    ],
  },
];

function FAQ() {
  return (
    <div className="container py-20">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground text-lg">
          Everything you need to know about Leena.ai
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full -space-y-px" defaultValue="3">
          {faqItems.map((item) => (
            <AccordionItem
              value={item.id}
              key={item.id}
              className="overflow-hidden border bg-background first:rounded-t-lg last:rounded-b-lg"
            >
              <AccordionTrigger className="px-4 py-3 text-[15px] leading-6 hover:no-underline">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="p-0">
                {item.collapsibles.map((collapsible, index) => (
                  <CollapsibleDemo
                    key={index}
                    title={collapsible.title}
                    content={collapsible.content}
                    open={collapsible.open}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

function CollapsibleDemo({
  title,
  content,
  open,
}: {
  title: string;
  content: string;
  open?: boolean;
}) {
  return (
    <Collapsible
      className="space-y-1 border-t border-border bg-accent px-4 py-3"
      defaultOpen={open}
    >
      <CollapsibleTrigger className="flex gap-2 text-[15px] font-semibold leading-6 [&[data-state=open]>svg]:rotate-180">
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="mt-1 shrink-0 opacity-60 transition-transform duration-200"
          aria-hidden="true"
        />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden ps-6 text-sm text-muted-foreground transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {content}
      </CollapsibleContent>
    </Collapsible>
  );
}

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
        <FAQ />
      </div>
      <Footerdemo />
    </div>
  );
};

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

export default Landing;