import { Link } from "react-router-dom";
import { Home, UtensilsCrossed, LineChart, Bot } from "lucide-react";

interface MobileNavProps {
  isAuthenticated: boolean;
}

export const MobileNav = ({ isAuthenticated }: MobileNavProps) => {
  if (!isAuthenticated) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-50">
      <div className="flex justify-around items-center p-2">
        <Link
          to="/"
          className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Home className="w-5 h-5 mb-1" />
          Home
        </Link>
        <Link
          to="/food-diary"
          className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <UtensilsCrossed className="w-5 h-5 mb-1" />
          Food
        </Link>
        <Link
          to="/reports"
          className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <LineChart className="w-5 h-5 mb-1" />
          Reports
        </Link>
        <Link
          to="/coach"
          className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Bot className="w-5 h-5 mb-1" />
          Coach
        </Link>
      </div>
    </nav>
  );
};