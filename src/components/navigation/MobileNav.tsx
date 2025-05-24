
import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, BarChart3, User, Camera, ArrowUpCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface MobileNavProps {
  onAddClick: () => void;
  onFileSelect: (file: File) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onAddClick, onFileSelect }) => {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isSubscribed, dailyLimitReached, redirectToCheckout } = useSubscription();

  const handleCameraClick = () => {
    if (dailyLimitReached && !isSubscribed) {
      redirectToCheckout();
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Calendar, label: "Diary", path: "/food-diary" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 text-xs ${
                isActive
                  ? "text-[#D946EF]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        {/* Camera button */}
        <button
          onClick={handleCameraClick}
          className={`flex flex-col items-center py-2 px-3 text-xs relative ${
            dailyLimitReached && !isSubscribed
              ? "text-amber-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {dailyLimitReached && !isSubscribed ? (
            <ArrowUpCircle className="h-5 w-5 mb-1" />
          ) : (
            <Camera className="h-5 w-5 mb-1" />
          )}
          <span>{dailyLimitReached && !isSubscribed ? "Upgrade" : "Camera"}</span>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            disabled={dailyLimitReached && !isSubscribed}
          />
        </button>
      </div>
    </div>
  );
};
