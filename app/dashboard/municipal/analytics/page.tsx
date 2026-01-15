'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowPathIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline';
import { BarChart, DonutChart, RadialProgress } from '@/components/AnalyticsCharts';

interface AnalyticsData {
  reportsByType: { name: string; value: number }[];
  weeklyActivity: { date: string; day: string; count: number }[];
  efficiency: {
    resolutionRate: number;
    fleetUptime: number;
    citizenEngagement: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/municipal/analytics');
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <ArrowPathIcon className="w-8 h-8 text-eco-500 animate-spin" />
          <p className="text-gray-500">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Operational Analytics</h1>
          <p className="text-gray-500">Insights into waste management performance</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
           <button className="px-3 py-1.5 text-sm font-medium bg-eco-50 text-eco-700 rounded-md flex items-center gap-2">
             <CalendarDaysIcon className="w-4 h-4" />
             Last 7 Days
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* KPI Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex flex-col items-center justify-center text-center"
        >
          <h3 className="text-gray-500 font-medium mb-4">Resolution Efficiency</h3>
          <RadialProgress percentage={data.efficiency.resolutionRate} label="Issues Resolved" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 flex flex-col items-center justify-center text-center"
        >
          <h3 className="text-gray-500 font-medium mb-4">Fleet Uptime</h3>
          <RadialProgress percentage={data.efficiency.fleetUptime} label="Vehicles Active" color="#3B82F6" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 flex flex-col justify-between"
        >
           <div>
             <h3 className="text-gray-500 font-medium mb-1">Total Citizens</h3>
             <p className="text-4xl font-bold text-gray-800">{data.efficiency.citizenEngagement}</p>
             <div className="flex items-center gap-1 text-green-600 text-sm mt-2">
               <span>+12%</span>
               <span>vs last week</span>
             </div>
           </div>
           
           <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">System Status</h4>
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                All Systems Operational
              </div>
           </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by Type */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <ChartBarSquareIcon className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-gray-700">Issue Distribution</h3>
          </div>
          <div className="h-64">
            <DonutChart data={data.reportsByType} />
          </div>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.4 }}
           className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <ChartBarSquareIcon className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-gray-700">Weekly Report Volume</h3>
          </div>
          <BarChart data={data.weeklyActivity} />
        </motion.div>
      </div>
    </div>
  );
}
