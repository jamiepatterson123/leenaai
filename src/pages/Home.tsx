import React from "react";
import { WeightInput } from "@/components/WeightInput";
import { ImageUpload } from "@/components/ImageUpload";
import { useNutritionTargets } from "@/components/nutrition/useNutritionTargets";
import { TargetsDisplay } from "@/components/profile/TargetsDisplay";

const Home = () => {
  const targets = useNutritionTargets();

  const handleImageSelect = (file: File) => {
    // TODO: Implement image processing logic
    console.log("Selected file:", file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to Your Dashboard</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Daily Targets</h2>
            <TargetsDisplay targets={targets} />
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Track Your Progress</h2>
            <WeightInput />
          </section>
        </div>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Upload Meal Photo</h2>
          <ImageUpload onImageSelect={handleImageSelect} />
        </section>
      </div>
    </div>
  );
};

export default Home;