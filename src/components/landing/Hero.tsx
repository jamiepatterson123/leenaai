import { Button } from "@/components/ui/button";
import { ChartBar, Leaf, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-background py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="animate-fade-up text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Track Your Nutrition Journey
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground animate-fade-up delay-100">
            Achieve your health goals with our intelligent food diary. Upload photos of your meals and get instant nutritional insights.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-up delay-200">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                <Leaf className="w-4 h-4" />
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};