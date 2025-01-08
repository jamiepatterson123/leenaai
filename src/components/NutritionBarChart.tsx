import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

interface NutritionChartProps {
  data: {
    name: string;
    value: number;
    target: number;
    color: string;
  }[];
}

export const NutritionBarChart: React.FC<NutritionChartProps> = ({ data }) => {
  const getBarColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage > 110) return "url(#redGradient)";
    if (percentage >= 90 && percentage <= 110) return "url(#greenGradient)";
    return "url(#orangeGradient)";
  };

  return (
    <div className="w-full h-[300px] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
        >
          <defs>
            <linearGradient id="redGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="targetGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="proteinGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="fatGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
          <XAxis type="number" className="text-xs font-medium" />
          <YAxis
            type="category"
            dataKey="name"
            className="text-xs font-medium"
            width={75}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            payload={[
              { value: 'Daily Target', type: 'rect', color: '#334155' },
              { value: 'Consumed Amount', type: 'rect', color: '#22c55e' },
            ]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const percentage = (data.value / data.target) * 100;
                let status = "";
                let statusColor = "";

                if (percentage > 110) {
                  status = "Over target";
                  statusColor = "text-red-500";
                } else if (percentage >= 90 && percentage <= 110) {
                  status = "Within target ✓";
                  statusColor = "text-green-600";
                } else {
                  status = "Under target";
                  statusColor = "text-orange-500";
                }

                return (
                  <div className="bg-background border border-border/50 rounded-lg p-2 text-sm">
                    <p className="font-medium">{data.name}</p>
                    <p>Consumed: {data.value.toFixed(1)}</p>
                    <p>Daily Target: {data.target}</p>
                    <p className={statusColor}>
                      {Math.round(percentage)}% - {status}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          <Bar
            name="Daily Target"
            dataKey="target"
            fill="url(#targetGradient)"
            radius={[0, 4, 4, 0]}
            barSize={30}
          />
          <Bar
            name="Consumed Amount"
            dataKey="value"
            radius={[0, 4, 4, 0]}
            barSize={30}
          >
            {data.map((entry, index) => {
              let fillColor = getBarColor(entry.value, entry.target);
              if (entry.name === "Protein") {
                fillColor = "url(#proteinGradient)";
              } else if (entry.name === "Fat") {
                fillColor = "url(#fatGradient)";
              }
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={fillColor}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
