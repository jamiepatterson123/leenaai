import { Card } from "@/components/ui/card";
import { ChartBar, Camera, Heart } from "lucide-react";

export const Features = () => {
  const features = [
    {
      name: "Photo Analysis",
      description: "Upload photos of your meals and get instant nutritional information",
      icon: Camera,
    },
    {
      name: "Track Progress",
      description: "Monitor your daily nutrition goals with beautiful visualizations",
      icon: ChartBar,
    },
    {
      name: "Health Insights",
      description: "Get personalized insights based on your dietary preferences",
      icon: Heart,
    },
  ];

  return (
    <div className="py-24 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Everything you need to track your nutrition
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our intelligent food diary helps you stay on track with your nutrition goals
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.name} className="bg-background/60 backdrop-blur-sm border-border/5">
                <div className="flex flex-col gap-6 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
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