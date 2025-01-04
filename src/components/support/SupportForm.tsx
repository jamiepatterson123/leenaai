import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SupportFormData {
  email: string;
  message: string;
}

export const SupportForm = () => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<SupportFormData>();

  const onSubmit = async (data: SupportFormData) => {
    try {
      const { error } = await supabase.functions.invoke('send-support-email', {
        body: {
          from: data.email,
          subject: "Support Request",
          message: data.message,
        }
      });

      if (error) throw error;

      toast.success("Support request sent successfully!");
      reset();
    } catch (error) {
      console.error("Error sending support request:", error);
      toast.error("Failed to send support request. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Your email address"
          {...register("email", { required: true })}
        />
      </div>
      <div>
        <Textarea
          placeholder="How can we help you?"
          className="min-h-[100px]"
          {...register("message", { required: true })}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
};