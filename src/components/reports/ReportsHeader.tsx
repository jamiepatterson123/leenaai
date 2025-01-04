import { TimeRange, TimeRangeSelector } from "./TimeRangeSelector";

interface ReportsHeaderProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export const ReportsHeader = ({ timeRange, onTimeRangeChange }: ReportsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Nutrition Dashboard</h1>
      <TimeRangeSelector 
        value={timeRange} 
        onChange={onTimeRangeChange}
      />
    </div>
  );
};