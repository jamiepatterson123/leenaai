import React from "react";

const Coach = () => {
  return (
    <div className="max-w-4xl mx-auto px-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        Your Coach
      </h1>
      <div className="space-y-8">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <p className="text-muted-foreground">
            The coaching feature is currently under development. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Coach;