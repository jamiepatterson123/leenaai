import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Testimonial } from "@/components/ui/testimonial";

function Hero() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [titleNumber, setTitleNumber] = useState(0);
  const [email, setEmail] = useState("");
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
    if (email) {
      navigate("/auth", { state: { email } });
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              AI-Powered Food Tracking <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-primary">Track your nutrition</span>
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
              {isMobile ? "With just photos of your food and advanced AI vision technology" : "With just photos of your food"}
            </p>
          </div>
          <div className="flex md:flex-row flex-col gap-3 w-full md:w-auto items-center">
            {isMobile ? (
              <>
                <Input
                  type="email"
                  placeholder="Your email here"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-[200px] h-[64px] md:w-[200px] text-lg text-center"
                />
                <Button 
                  size="lg" 
                  className="gap-4 w-[200px] md:w-[200px] h-[64px]"
                  onClick={handleSubmit}
                >
                  Create a free account <MoveRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Input
                  type="email"
                  placeholder="Your email here"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-[200px] h-[64px] md:w-[200px] text-lg text-center"
                />
                <Button 
                  size="lg" 
                  className="gap-4 w-[200px] md:w-[200px] h-[64px]"
                  onClick={handleSubmit}
                >
                  Create a free account <MoveRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          <div className="mt-4">
            <Testimonial />
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };