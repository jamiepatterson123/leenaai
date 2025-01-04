import React from "react";
import { Construction } from "lucide-react";

const Coach = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center">
      <Construction className="w-16 h-16 mb-4 text-primary" />
      <h1 className="text-3xl font-bold mb-2">Coming Soon</h1>
      <p className="text-muted-foreground">
        Our AI nutrition coach is currently in development. Check back soon for personalized nutrition guidance!
      </p>
    </div>
  );
};

export default Coach;