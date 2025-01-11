export type TimeRange = "1d" | "1w" | "2w" | "1m" | "2m" | "3m" | "6m" | "1y";

export const TimeRangeSelector = ({ 
  timeRange, 
  onTimeRangeChange 
}: { 
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}) => {
  return (
    <select
      value={timeRange}
      onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
      className="border rounded px-2 py-1"
    >
      <option value="1d">Last 24 hours</option>
      <option value="1w">Last week</option>
      <option value="2w">Last 2 weeks</option>
      <option value="1m">Last month</option>
      <option value="2m">Last 2 months</option>
      <option value="3m">Last 3 months</option>
      <option value="6m">Last 6 months</option>
      <option value="1y">Last year</option>
    </select>
  );
};