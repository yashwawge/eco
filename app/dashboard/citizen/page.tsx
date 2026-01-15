'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  MapPinIcon,
  SparklesIcon,
  BellIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CitizenDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [nextCollection, setNextCollection] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch Stats
      const statsRes = await fetch('/api/citizen/stats');
      if (statsRes.ok) {
        setUserData(await statsRes.json());
      }
      // Fetch Schedule
      const scheduleRes = await fetch('/api/citizen/schedule');
      if (scheduleRes.ok) {
        setNextCollection(await scheduleRes.json());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {session?.user?.name}! 👋
        </h1>
        <p className="text-gray-600">Track your waste collection and earn Eco-Points</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="stats-card bg-gradient-eco text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{userData?.ecoPoints || 0}</div>
              <div className="text-eco-100">Eco-Points</div>
            </div>
            <SparklesIcon className="w-12 h-12 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="stats-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-800">{userData?.reportsSubmitted || 0}</div>
              <div className="text-gray-600">Reports Submitted</div>
            </div>
            <MapPinIcon className="w-12 h-12 text-eco-600 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="stats-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-800">{userData?.compostSold || 0}kg</div>
              <div className="text-gray-600">Compost Sold</div>
            </div>
            <SparklesIcon className="w-12 h-12 text-earth-600 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Next Collection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Next Collection</h2>
          <Link href="/dashboard/citizen/track" className="text-eco-600 hover:text-eco-700 font-semibold flex items-center gap-2">
            Track Vehicle <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {nextCollection?.schedule ? (
          <div className="bg-eco-50 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-eco-600 p-3 rounded-full">
                <TruckIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {new Date(nextCollection.schedule.scheduledTime).toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' })}
                </div>
                <div className="text-gray-600 capitalize">{nextCollection.schedule.wasteType} Waste Collection</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-eco-700">
              <BellIcon className="w-5 h-5" />
              <span className="text-sm">We'll notify you 30 minutes before arrival</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
            No upcoming collection scheduled.
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Track Vehicle',
            description: 'See real-time location',
            icon: MapPinIcon,
            href: '/dashboard/citizen/track',
            color: 'eco',
          },
          {
            title: 'Report Issue',
            description: 'Geo-tagged reporting',
            icon: MapPinIcon,
            href: '/dashboard/citizen/report',
            color: 'ocean',
          },
          {
            title: 'Composting Hub',
            description: 'Guides & marketplace',
            icon: SparklesIcon,
            href: '/dashboard/citizen/compost',
            color: 'earth',
          },
          {
            title: 'My Rewards',
            description: 'View Eco-Points',
            icon: SparklesIcon,
            href: '/dashboard/citizen/rewards',
            color: 'eco',
          },
        ].map((action, index) => (
          <Link key={index} href={action.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="card-hover"
            >
              <action.icon className={`w-10 h-10 text-${action.color}-600 mb-3`} />
              <h3 className="font-bold text-gray-800 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
