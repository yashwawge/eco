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
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextSchedule, setNextSchedule] = useState<any>(null);

  // Fetch user location from profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/citizen/stats');
        if (res.ok) {
          const data = await res.json();
          // User location will be fetched from their profile
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    // Get user location from browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to Bangalore center if geolocation fails
          setUserLocation({ lat: 12.9716, lng: 77.5946 });
        }
      );
    } else {
      // Fallback to Bangalore center
      setUserLocation({ lat: 12.9716, lng: 77.5946 });
    }
  }, []);

  // Fetch vehicles and schedule
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vehicles
        const vehiclesRes = await fetch('/api/vehicles');
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData.vehicles || []);

        // Fetch next schedule
        const scheduleRes = await fetch('/api/citizen/schedule');
        const scheduleData = await scheduleRes.json();
        setNextSchedule(scheduleData.schedule);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate ETA based on next schedule
  const calculateETA = () => {
    if (!nextSchedule) return null;

    const now = new Date();
    const scheduledTime = new Date(nextSchedule.estimatedArrival || nextSchedule.scheduledTime);
    const diffMs = scheduledTime.getTime() - now.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));

    return diffMins;
  };

  const eta = calculateETA();

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

          {nextSchedule && eta !== null && (
            <div className="glass-card p-6 bg-gradient-eco text-white">
              <div className="flex items-center gap-3 mb-2">
                <ClockIcon className="w-6 h-6" />
                <h2 className="font-semibold text-lg">Estimated Arrival</h2>
              </div>
              <div className="text-4xl font-bold mb-1">{eta} mins</div>
              <p className="text-eco-100 text-sm">
                {nextSchedule.status === 'in_transit' ? 'Vehicle is on the way' : 'Scheduled for collection'}
              </p>
            </div>
          )}

          {!nextSchedule && !loading && (
            <div className="glass-card p-6 bg-gray-50">
              <p className="text-gray-600 text-center">No upcoming collection scheduled</p>
            </div>
          )}

          <div className="glass-card p-6 flex-1 overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-4">Nearby Vehicles</h3>
            <div className="space-y-4">
              {vehicles.filter(v => v.status === 'active').map((vehicle) => (
                <div key={vehicle._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-eco-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{vehicle.vehicleNumber}</span>
                    <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <div className="font-medium text-gray-800 mb-1">{vehicle.type.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3" />
                    {vehicle.scheduledAreas?.join(', ') || 'No route assigned'}
                  </div>
                </div>
              ))}
              {vehicles.filter(v => v.status === 'active').length === 0 && (
                <p className="text-gray-400 text-sm text-center">No active vehicles nearby</p>
              )}
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
            vehicles={vehicles.filter(v => v.status === 'active')}
            userLocation={userLocation || undefined}
          />
        </motion.div>
      </div>
    </div>
  );
}
