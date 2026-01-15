'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { TrophyIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface PointHistory {
  points: number;
  reason: string;
  date: string;
  type: 'credit' | 'debit';
}

interface LeaderboardUser {
  _id: string;
  name: string;
  points: number;
}

export default function RewardsPage() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ecopoints');
      const data = await res.json();
      setHistory(data.history || []);
      setLeaderboard(data.leaderboard || []);
      setBalance(data.balance || 0);
    } catch (error) {
      console.error('Error fetching rewards data:', error);
    }
  };

  return (
    <div className="page-container">
      {/* Header Stats */}
      <div className="bg-gradient-eco rounded-3xl p-8 text-white mb-8 shadow-eco-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <SparklesIcon className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">My Eco-Wallet</h1>
          <p className="opacity-90 mb-6">Redeem points for tax rebates or shopping vouchers</p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-bold">{balance}</span>
            <span className="text-xl font-medium">Points</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* History Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {history.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {history.map((item, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${item.points > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        <StarIcon className={`w-5 h-5 ${item.points > 0 ? 'text-green-600' : 'text-red-500'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item.reason}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                      </div>
                    </div>
                    <div className={`font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {item.points > 0 ? '+' : ''}{item.points}
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">No history yet. Start reporting to earn!</div>
            )}
          </div>
        </div>

        {/* Leaderboard Column */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrophyIcon className="w-8 h-8 text-yellow-500" />
            Top Citizens
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="space-y-4">
              {leaderboard.map((user, index) => (
                <div key={user._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                    index === 1 ? 'bg-gray-200 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 font-medium text-gray-800">{user.name}</div>
                  <div className="font-bold text-eco-600">{user.points}</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 btn-secondary py-2 text-sm">
              View Full Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
