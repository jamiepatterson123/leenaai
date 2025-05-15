
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { Header1 } from "@/components/ui/header";
import { Hero } from "@/components/ui/animated-hero";

const Landing = () => {
  const navigate = useNavigate();
  const { session, loading } = useSession();

  useEffect(() => {
    if (session && !loading) {
      navigate("/dashboard");
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <img 
            src="/app-icon.png" 
            alt="Leena.ai" 
            className="h-12 w-12 opacity-70"
          />
          <div className="h-2 w-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header1 />
      <div className="pt-20">
        <Hero />
      </div>
    </div>
  );
};

export default Landing;
