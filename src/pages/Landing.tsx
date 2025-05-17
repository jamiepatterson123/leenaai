
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
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header1 />
      <div className="flex-grow">
        <Hero />
      </div>
    </div>
  );
}

export default Landing;
