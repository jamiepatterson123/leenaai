import React from "react";
import { Link } from "react-router-dom";
import { Plug, GraduationCap, MessageSquare, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const MoreDropdown = () => {
  const dropdownItems = [
    { icon: Plug, text: "Integrations", to: "/integrations" },
    { icon: GraduationCap, text: "Learn", to: "/learn" },
    { icon: MessageSquare, text: "Community", to: "/community" },
  ];

  return (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};