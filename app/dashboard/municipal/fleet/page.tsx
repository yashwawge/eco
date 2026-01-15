'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  TruckIcon, 
  SignalIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-gray-100 rounded-2xl animate-pulse">
      <div className="text-gray-400">Loading Fleet Map...</div>
    </div>
  )
});

interface Vehicle {
  _id: string;
  registrationNumber: string;
  driverName?: string;
  status: 'active' | 'maintenance' | 'stopped';
  contactNumber?: string;
  currentLoad?: number;
  fuelLevel?: number;
  location: {
    lat: number;
    lng: number;
  };
  route?: {
    name: string;
  };
}

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetchVehicles();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchVehicles, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      // Ensure data is array
      const vehicleList = Array.isArray(data) ? data : data.vehicles || [];
      setVehicles(vehicleList);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'maintenance': return 'text-orange-600 bg-orange-100';
      case 'stopped': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/municipal" 
          className="p-2 rounded-full hover:bg-white/50 transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fleet Management</h1>
          <p className="text-gray-500">Real-time tracking and status monitoring</p>
        </div>
        <div className="ml-auto flex gap-2">
          <div className="stat-card py-2 px-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium">{vehicles.filter(v => v.status === 'active').length} Active</span>
          </div>
          <div className="stat-card py-2 px-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-sm font-medium">{vehicles.filter(v => v.status === 'maintenance').length} Maint.</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
        {/* Vehicle List - Left Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto pr-2"
        >
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 animate-pulse h-24"></div>
            ))
          ) : (
            vehicles.map((vehicle) => (
              <motion.div
                key={vehicle._id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`glass-card p-4 cursor-pointer border-2 transition-all ${
                  selectedVehicle?._id === vehicle._id 
                    ? 'border-eco-500 shadow-md' 
                    : 'border-transparent hover:border-eco-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <TruckIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{vehicle.registrationNumber}</h3>
                      <p className="text-xs text-gray-500">{vehicle.driverName || 'No Driver'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{vehicle.route?.name || 'No Route'}</span>
                  </div>
                  {/* Simulated Metrics */}
                  <div className="flex items-center gap-1">
                    <SignalIcon className="w-4 h-4 text-gray-400" />
                    <span>GPS: Strong</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Map View */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 glass-card p-2 relative rounded-2xl overflow-hidden shadow-xl"
        >
          <Map
            center={[12.9716, 77.5946]}
            zoom={13}
            vehicles={vehicles}
            className="w-full h-full rounded-xl"
          />
          
          {/* Map Overlay Stats for Selected Vehicle */}
          {selectedVehicle && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 glass-card p-4 z-[1000] border-t-4 border-eco-500"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{selectedVehicle.registrationNumber}</h3>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVehicle(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Driver</span>
                  <span className="font-medium">{selectedVehicle.driverName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Contact</span>
                  <span className="font-medium">{selectedVehicle.contactNumber || 'N/A'}</span>
                </div>
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Load Capacity</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${(selectedVehicle.currentLoad || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="btn-secondary text-xs py-1">View History</button>
                <button className="btn-primary text-xs py-1">Contact Driver</button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
