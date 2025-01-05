import { Link } from "react-router-dom";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesktopNavProps {
  handleShare: () => void;
  handleSignOut: () => void;
  theme: "light" | "dark";
  toggleTheme: (checked: boolean) => void;
}

export const DesktopNav = ({
  handleShare,
}: DesktopNavProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-6">
      <Link to="/" className="text-foreground hover:text-foreground/80">
        Home
      </Link>
      <Link to="/food-diary" className="text-foreground hover:text-foreground/80">
        Food Diary
      </Link>
      <Link to="/reports" className="text-foreground hover:text-foreground/80">
        Reports
      </Link>
      <Link to="/coach" className="text-foreground hover:text-foreground/80">
        Coach
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="text-gray-600"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </nav>
  );
};