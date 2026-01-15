'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

// Dynamically import map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-gray-100 rounded-2xl animate-pulse">
      <div className="text-gray-400">Loading Map...</div>
    </div>
  )
});

export default function TrackPage() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState<number>(15); // Simulated ETA in minutes

  // Initial data fetch
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        setVehicles(data.vehicles || []);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();

    // Get user location (mock or real)
    // For demo, we'll use a fixed location near our seed data or the user's registered address
    // In a real app, we'd use navigator.geolocation
    setUserLocation({ lat: 12.9352, lng: 77.6245 }); // Koramangala
  }, []);

  // Simulate vehicle movement
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => ({
        ...v,
        currentLocation: {
          lat: v.currentLocation.lat + (Math.random() - 0.5) * 0.001,
          lng: v.currentLocation.lng + (Math.random() - 0.5) * 0.001,
        }
      })));
      
      // Update ETA
      setEta(prev => Math.max(1, prev - 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-120px)]">
        {/* Sidebar Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-80 flex flex-col gap-4"
        >
          <div className="glass-card p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Live Tracking</h1>
            <p className="text-gray-600 text-sm">Monitor waste collection vehicles in real-time</p>
          </div>

          <div className="glass-card p-6 bg-gradient-eco text-white">
            <div className="flex items-center gap-3 mb-2">
              <ClockIcon className="w-6 h-6" />
              <h2 className="font-semibold text-lg">Estimated Arrival</h2>
            </div>
            <div className="text-4xl font-bold mb-1">{eta} mins</div>
            <p className="text-eco-100 text-sm">Vehicle is approaching your area</p>
          </div>

          <div className="glass-card p-6 flex-1 overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-4">Nearby Vehicles</h3>
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-eco-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{vehicle.vehicleNumber}</span>
                    <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <div className="font-medium text-gray-800 mb-1">{vehicle.type.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3" />
                    {vehicle.route}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Map Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 glass-card p-2 relative"
        >
          <Map 
            center={userLocation ? [userLocation.lat, userLocation.lng] : [12.9716, 77.5946]}
            zoom={14}
            vehicles={vehicles}
            userLocation={userLocation || undefined}
          />
          
          {/* Map Overlay Controls */}
          <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
            <button 
              onClick={() => setUserLocation({ lat: 12.9352, lng: 77.6245 })}
              className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
              title="Recenter"
            >
              <MapPinIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
