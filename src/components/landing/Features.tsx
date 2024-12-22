import { Card } from "@/components/ui/card";
import { Camera, ChartBar, Heart, Brain, Zap, Trophy } from "lucide-react";

export const Features = () => {
  const features = [
    {
      name: "AI-Powered Analysis",
      description: "Upload photos of your meals and get instant nutritional information powered by advanced AI",
      icon: Brain,
    },
    {
      name: "Real-time Tracking",
      description: "Monitor your daily nutrition goals with beautiful visualizations and instant feedback",
      icon: ChartBar,
    },
    {
      name: "Smart Insights",
      description: "Get personalized recommendations based on your dietary preferences and goals",
      icon: Zap,
    },
    {
      name: "Photo Recognition",
      description: "Our advanced AI recognizes foods from your photos with incredible accuracy",
      icon: Camera,
    },
    {
      name: "Progress Tracking",
      description: "Set goals and track your progress with motivating milestone achievements",
      icon: Trophy,
    },
    {
      name: "Health Focus",
      description: "Stay on top of your health with comprehensive nutrition monitoring",
      icon: Heart,
    },
  ];

  return (
    <div className="py-24 bg-gradient-to-b from-background to-primary/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
            Everything you need to achieve your goals
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our intelligent food diary helps you stay on track with your nutrition goals using cutting-edge technology
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.name} className="group hover:scale-105 transition-all duration-200 bg-background/60 backdrop-blur-sm border-border/5">
                <div className="flex flex-col gap-6 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <dt className="text-lg font-semibold leading-7 text-foreground">
                      {feature.name}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-muted-foreground">
                      {feature.description}
                    </dd>
                  </div>
                </div>
              </Card>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};