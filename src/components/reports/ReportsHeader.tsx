import { TimeRange, TimeRangeSelector } from "./TimeRangeSelector";

interface ReportsHeaderProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export const ReportsHeader = ({ timeRange, onTimeRangeChange }: ReportsHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
      <TimeRangeSelector 
        value={timeRange} 
        onChange={onTimeRangeChange}
      />
    </div>
  );
};