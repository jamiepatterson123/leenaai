import { Hero } from "@/components/ui/animated-hero";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";

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
      <Hero />
    </div>
  );
};

export default Landing;