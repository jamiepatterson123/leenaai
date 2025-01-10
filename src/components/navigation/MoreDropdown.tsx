import React from "react";
import { Link } from "react-router-dom";
import { Plug, GraduationCap, MessageSquare, ChevronDown, HelpCircle, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SupportForm } from "@/components/support/SupportForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const MoreDropdown = () => {
  const [supportDialogOpen, setSupportDialogOpen] = React.useState(false);
  const navigate = useNavigate();
  
  const dropdownItems = [
    { icon: Plug, text: "Integrations", to: "/integrations" },
    { icon: GraduationCap, text: "Learn", to: "/learn" },
    { icon: MessageSquare, text: "Community", to: "/community" },
  ];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            More
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {dropdownItems.map((item) => (
            <DropdownMenuItem key={item.to} asChild>
              <Link to={item.to} className="flex items-center gap-2">
                <item.icon className="w-4 h-4" />
                {item.text}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onSelect={() => setSupportDialogOpen(true)}>
            <HelpCircle className="w-4 h-4 mr-2" />
            Support
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
          </DialogHeader>
          <SupportForm />
        </DialogContent>
      </Dialog>
    </>
  );
};