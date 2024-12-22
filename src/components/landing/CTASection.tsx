import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChartBar } from "lucide-react";

export const CTASection = () => {
  return (
    <div className="relative isolate overflow-hidden bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Start your journey today
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Join thousands of users who are already tracking their nutrition journey with our intelligent food diary.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                <ChartBar className="w-4 h-4" />
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};