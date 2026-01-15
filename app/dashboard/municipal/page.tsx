'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  TruckIcon, 
  ClipboardDocumentCheckIcon, 
  ChartBarIcon, 
  MapIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface Stats {
  totalReports: number;
  pendingReports: number;
  resolvedRate: number;
  activeVehicles: number;
  totalCitizens: number;
}

interface RecentReport {
  _id: string;
  type: string;
  status: string;
  reportedBy: { name: string };
  createdAt: string;
}

export default function MunicipalDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/municipal/stats');
      const data = await res.json();
      setStats(data.stats);
      setRecentReports(data.recentReports);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    { label: 'Pending Reports', value: stats?.pendingReports || 0, icon: ClipboardDocumentCheckIcon, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Active Vehicles', value: stats?.activeVehicles || 0, icon: TruckIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Resolution Rate', value: `${stats?.resolvedRate || 0}%`, icon: ChartBarIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Citizens', value: stats?.totalCitizens || 0, icon: UserGroupIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Municipal Command Center</h1>
          <p className="text-gray-600">Overview of city waste management operations</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">System Online</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Bangalore South</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <h3 className="text-gray-600 font-medium">{stat.label}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Management Modules</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/dashboard/municipal/fleet" className="group card-hover bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                    <TruckIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-1">Fleet Tracking</h3>
                    <p className="text-gray-600 text-sm">Monitor garbage trucks, routes, and driver status in real-time.</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/municipal/reports" className="group card-hover bg-gradient-to-br from-red-50 to-white">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                    <ClipboardDocumentCheckIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-1">Issue Reports</h3>
                    <p className="text-gray-600 text-sm">Review, verify, and assign cleanup crews to reported issues.</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/municipal/routes" className="group card-hover bg-gradient-to-br from-purple-50 to-white">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                    <MapIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-1">Route Planning</h3>
                    <p className="text-gray-600 text-sm">Optimize collection routes based on volume and traffic.</p>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        </div>

        {/* Live Feed */}
        <div className="glass-card p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
            Recent Alerts
            <span className="text-xs font-normal text-gray-500">Live Feed</span>
          </h2>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report._id} className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  report.status === 'pending' ? 'bg-red-500' : 'bg-green-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-800 text-sm">{report.type.replace('_', ' ')} reported</p>
                  <p className="text-xs text-gray-500">by {report.reportedBy?.name} • <span className="capitalize">{report.status}</span></p>
                </div>
              </div>
            ))}
            {recentReports.length === 0 && (
              <p className="text-gray-400 text-sm text-center">No recent activity</p>
            )}
            <Link href="/dashboard/municipal/reports" className="block text-center text-sm text-eco-600 font-medium hover:underline pt-2">
              View All Alerts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
