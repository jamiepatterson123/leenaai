import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordFormData {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export const PasswordChange = () => {
  const [hasPassword, setHasPassword] = useState<boolean>(true);
  const form = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  useEffect(() => {
    const checkPasswordStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.app_metadata?.provider === 'email' && !user?.user_metadata?.has_set_password) {
        setHasPassword(false);
      }
    };

    checkPasswordStatus();
  }, []);

  const onSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (data.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;

      // Update user metadata to indicate password has been set
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { has_set_password: true }
      });

      if (metadataError) throw metadataError;

      setHasPassword(true);
      toast.success("Password updated successfully");
      
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{hasPassword ? "Change Password" : "Set Password"}</CardTitle>
        <CardDescription>
          {hasPassword 
            ? "Update your password to keep your account secure"
            : "Set a password to secure your account for future logins"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasPassword && (
          <Alert className="mb-6">
            <AlertDescription>
              You need to set a password to be able to log in to your account in the future.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {hasPassword && (
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter current password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {hasPassword ? "Update Password" : "Set Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};