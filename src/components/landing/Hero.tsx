import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Zap, Activity } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-background py-32 lg:py-48">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 -z-10" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm leading-6 text-primary bg-primary/10 ring-1 ring-primary/20 mb-8">
              <span className="font-semibold">New Feature</span>
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <h1 className="animate-fade-up text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent pb-2">
            Transform Your Health Journey
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground animate-fade-up opacity-90">
            Track your nutrition with AI-powered insights. Upload photos of your meals and get instant nutritional analysis. Your personal health coach in your pocket.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-up">
            <Link to="/auth">
              <Button size="lg" className="gap-2 group hover:scale-105 transition-all duration-200">
                Start Your Journey
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 opacity-85">
          <div className="flex flex-col items-center justify-center p-6 bg-background/50 backdrop-blur-sm rounded-lg border border-border/5 hover:scale-105 transition-transform duration-200">
            <Activity className="w-8 h-8 text-primary mb-2" />
            <div className="text-2xl font-bold">10K+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="flex flex-col items-center justify-center p-6 bg-background/50 backdrop-blur-sm rounded-lg border border-border/5 hover:scale-105 transition-transform duration-200">
            <Leaf className="w-8 h-8 text-primary mb-2" />
            <div className="text-2xl font-bold">1M+</div>
            <div className="text-sm text-muted-foreground">Meals Tracked</div>
          </div>
          <div className="flex flex-col items-center justify-center p-6 bg-background/50 backdrop-blur-sm rounded-lg border border-border/5 hover:scale-105 transition-transform duration-200">
            <Zap className="w-8 h-8 text-primary mb-2" />
            <div className="text-2xl font-bold">98%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};