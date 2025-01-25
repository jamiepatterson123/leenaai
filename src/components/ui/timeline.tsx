import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";

interface TimelineData {
  title: string;
  content: React.ReactNode;
}

interface TimelineProps {
  data: TimelineData[];
}

export const Timeline = ({ data }: TimelineProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div
      className={cn(
        "relative min-h-screen w-full",
        "after:absolute after:inset-0",
        "bg-background text-foreground"
      )}
    >
      <div className="container py-20">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Choose Your Nutrition Journey
          </h2>
          <p className="text-muted-foreground text-lg whitespace-pre-line">
            Start your path to better health with a plan that fits your needs.
            All plans include core tracking features and regular updates.
          </p>
        </div>

        <div className="relative mx-auto max-w-container">
          {data.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 100 }}
              whileInView={
                isDesktop
                  ? {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 1,
                        delay: idx * 0.2,
                        ease: [0.21, 0.47, 0.32, 0.98],
                      },
                    }
                  : {}
              }
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-5 mb-16 last:mb-0"
            >
              <div className="lg:col-span-2 lg:pr-8 lg:text-right mb-4 lg:mb-0">
                <div className="text-xl font-semibold text-foreground">
                  {item.title}
                </div>
              </div>

              <div className="lg:col-span-3">{item.content}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};