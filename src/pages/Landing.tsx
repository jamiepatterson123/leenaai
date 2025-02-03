import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { Header1 } from "@/components/ui/header";
import { Hero } from "@/components/ui/animated-hero";
import { Testimonial } from "@/components/ui/testimonial";

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
    <div className="min-h-screen bg-white">
      <Header1 />
      <div className="pt-20">
        <Hero />
      </div>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:hidden">
        <Testimonial />
      </div>
    </div>
  );
};

export default Landing;