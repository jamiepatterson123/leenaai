
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Camera, ChevronDown } from "lucide-react";
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

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      <div className="relative min-h-screen flex items-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50/30 to-white -z-10"></div>
        
        {/* Hero content */}
        <div className="container mx-auto px-4">
          <div className="flex gap-8 py-20 lg:py-32 items-center justify-center flex-col max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <Button variant="secondary" size="sm" className="gap-2 mb-8 shadow-sm">
                AI-Powered Food Tracking <MoveRight className="w-4 h-4" />
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-4 flex-col"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-3xl tracking-tight text-center font-heading font-semibold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                  Track your nutrition
                </span>
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

              <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
                Snap photos of your meals and get instant nutritional analysis with AI-powered accuracy.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col items-center gap-6"
            >
              <Button 
                size="lg" 
                className="gap-2 w-[200px] md:w-[220px] h-[60px] rounded-full shadow-md hover:shadow-lg transition-all btn-hover-effect"
                onClick={handleSubmit}
              >
                <Camera className="w-4 h-4 mr-1" />
                Start free trial
                <MoveRight className="w-4 h-4" />
              </Button>
              
              <p className="text-sm text-muted-foreground">
                No credit card required • Free 10 analyses
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8"
            >
              <Testimonial />
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={scrollToFeatures}
        >
          <ChevronDown className="animate-bounce w-6 h-6 text-muted-foreground" />
        </motion.div>
      </div>
      
      {/* Features section placeholder */}
      <div id="features" className="py-20">
        {/* Features will be added here */}
      </div>
    </div>
  );
}

export { Hero };
