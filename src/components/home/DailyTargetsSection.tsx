import { TargetsDisplay } from "@/components/profile/TargetsDisplay";
import { TargetCalculations } from "@/utils/profileCalculations";

interface DailyTargetsSectionProps {
  targets: TargetCalculations | null;
}

export const DailyTargetsSection = ({ targets }: DailyTargetsSectionProps) => {
  if (!targets) return null;
  
  return (
    <div className="rounded-lg overflow-hidden shadow-lg animate-fade-up">
      <TargetsDisplay targets={targets} />
    </div>
  );
};