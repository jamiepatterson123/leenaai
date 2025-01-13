import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Leena.ai</h1>
        <Button 
          onClick={() => navigate("/auth")} 
          className="mt-4"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;