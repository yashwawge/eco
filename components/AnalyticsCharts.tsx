'use client';

import { motion } from 'framer-motion';

// --- Bar Chart Component ---
interface BarChartProps {
  data: { date: string; day: string; count: number }[];
  color?: string;
}

export const BarChart = ({ data, color = 'bg-eco-500' }: BarChartProps) => {
  const max = Math.max(...data.map(d => d.count), 1); // Avoid div by zero

  return (
    <div className="w-full h-64 flex items-end justify-between gap-2 pt-4 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
          <div className="relative w-full flex items-end justify-center h-48 bg-gray-50 rounded-lg overflow-hidden">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.count / max) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`w-full mx-1 rounded-t-lg ${color} opacity-80 group-hover:opacity-100 transition-opacity relative`}
            >
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {d.count} Reports
              </div>
            </motion.div>
          </div>
          <span className="text-xs text-gray-500 font-medium">{d.day}</span>
        </div>
      ))}
    </div>
  );
};

// --- Donut Chart Component ---
interface DonutChartProps {
  data: { name: string; value: number }[];
}

export const DonutChart = ({ data }: DonutChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulatedAngle = 0;
  
  // Eco-friendly color palette
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 h-full justify-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
          {data.map((item, i) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const radius = 40;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedAngle / 360) * circumference);
            
            accumulatedAngle += angle;

            return (
              <motion.circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={colors[i % colors.length]}
                strokeWidth="15"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset} // Initial offset for animation logic would be complex with SVG stroke-dashoffset, simplifying for dynamic data render
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray }}
                transition={{ duration: 1, delay: 0.2 }}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700">
          <span className="text-3xl font-bold">{total}</span>
          <span className="text-xs text-gray-400 uppercase tracking-widest">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></div>
            <span className="text-sm text-gray-600 capitalize">{item.name.replace('_', ' ')}</span>
            <span className="text-sm font-bold text-gray-800 ml-auto">{Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Radial Progress ---
interface RadialProps {
  percentage: number;
  label: string;
  color?: string;
}

export const RadialProgress = ({ percentage, label, color = '#10B981' }: RadialProps) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#f3f4f6"
            strokeWidth="8"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            style={{ strokeDasharray: circumference }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-700">
          {percentage}%
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-600">{label}</span>
      <span className="text-xs text-gray-400">Target: 95%</span>
    </div>
  );
};
