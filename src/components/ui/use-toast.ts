
import { useToast, toast } from "@/hooks/use-toast";

// Helper functions for common toast variants
const extendedToast = Object.assign(toast, {
  success: (message: string) => toast({
    title: "Success",
    description: message,
    variant: "default",
  }),
  error: (message: string) => toast({
    title: "Error",
    description: message,
    variant: "destructive",
  }),
  info: (message: string) => toast({
    title: "Info",
    description: message,
    variant: "default",
  }),
});

export { useToast, extendedToast as toast };
