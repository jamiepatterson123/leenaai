
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Testimonial } from "@/components/ui/testimonial";

function Hero() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["effortlessly", "accurately", "intelligently"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  const handleSubmit = () => {
    navigate("/auth");
  };

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex flex-col justify-between min-h-[70vh] py-12">
          {/* Top section with AI badge */}
          <div className="mb-10 mt-16">
            <Button variant="secondary" size="sm" className="gap-4">
              AI-Powered Food Tracking <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Middle section with main text content */}
          <div className="flex gap-8 flex-col mb-10">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular font-poppins">
              <span className="text-gradient">Track your nutrition</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center font-poppins">
              With just photos of your food
            </p>
          </div>
          
          {/* Call to action button */}
          <div className="flex items-center justify-center mb-12">
            <Button 
              variant="gradient"
              size="lg" 
              className="gap-4 w-[200px] md:w-[200px] h-[64px] font-poppins"
              onClick={handleSubmit}
            >
              Start free <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Testimonial section */}
          <div className="mt-auto">
            <Testimonial />
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
