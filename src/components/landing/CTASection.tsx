import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export const CTASection = () => {
  return (
    <div className="relative isolate overflow-hidden bg-background py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-primary/10 -z-10" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
            Join thousands achieving their goals
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Start your journey today and experience the power of AI-driven nutrition tracking. Join our community of successful achievers.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/auth">
              <Button size="lg" className="gap-2 group hover:scale-105 transition-all duration-200">
                <Sparkles className="w-4 h-4" />
                Get Started Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};