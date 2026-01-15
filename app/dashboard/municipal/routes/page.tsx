'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapIcon, 
  TruckIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-gray-100 rounded-2xl animate-pulse">
      <div className="text-gray-400">Loading Route Map...</div>
    </div>
  )
});

interface Route {
  _id: string;
  name: string;
  startLocation: { address: string };
  endLocation: { address: string };
  totalDistance: number;
  estimatedDuration: number;
  status: 'active' | 'completed' | 'pending';
  assignedVehicle?: {
    _id: string;
    vehicleNumber: string;
    driver: string;
    status: string;
  } | null;
  waypoints: { lat: number; lng: number }[];
}

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  driver: string;
  status: string;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchRoutes();
    fetchVehicles();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await fetch('/api/municipal/routes');
      const data = await res.json();
      setRoutes(data.routes || []);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      // Filter for active vehicles available for assignment (simplified logic)
      setVehicles((data.vehicles || []).filter((v: any) => v.status === 'active'));
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const handleAssignVehicle = async (vehicleId: string) => {
    if (!selectedRoute) return;
    setIsAssigning(true);
    try {
      const res = await fetch('/api/municipal/routes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: selectedRoute._id,
          vehicleId
        }),
      });
      
      if (res.ok) {
        // Refresh data
        await fetchRoutes();
        // Update selected route local state
        const updatedRoutes = await (await fetch('/api/municipal/routes')).json();
        const updated = updatedRoutes.routes.find((r: Route) => r._id === selectedRoute._id);
        setSelectedRoute(updated || null);
      }
    } catch (error) {
      console.error('Failed to assign vehicle:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="page-container h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Route Planning</h1>
        <p className="text-gray-500">Optimize collection paths and assign vehicles</p>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Route List */}
        <div className="w-full md:w-1/3 overflow-y-auto pr-2 space-y-4">
          {loading ? (
             [1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 animate-pulse h-24"></div>
            ))
          ) : (
            routes.map((route) => (
              <motion.div
                key={route._id}
                onClick={() => setSelectedRoute(route)}
                className={`glass-card p-4 cursor-pointer border-2 transition-all hover:scale-[1.01] ${
                  selectedRoute?._id === route._id 
                    ? 'border-eco-500 shadow-lg' 
                    : 'border-transparent hover:border-eco-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{route.name}</h3>
                  {route.assignedVehicle ? (
                     <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                       <CheckCircleIcon className="w-3 h-3" /> Assigned
                     </span>
                  ) : (
                     <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1">
                       <ExclamationCircleIcon className="w-3 h-3" /> Unassigned
                     </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapIcon className="w-3 h-3" /> {route.totalDistance} km
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" /> {route.estimatedDuration} min
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Map & Details */}
        <div className="flex-1 glass-card p-2 relative rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="flex-1 relative">
             <Map
               center={[12.9716, 77.5946]}
               zoom={12}
               routes={routes} // All routes shown on map
             />
          </div>
          
          {/* Selected Route Details Overlay */}
          <AnimatePresence>
            {selectedRoute && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-6 z-[1000] rounded-t-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedRoute.name}</h2>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold block text-xs uppercase text-gray-400">Start</span>
                        {selectedRoute.startLocation.address}
                      </div>
                      <div>
                         <span className="font-semibold block text-xs uppercase text-gray-400">End</span>
                         {selectedRoute.endLocation.address}
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto">
                    {selectedRoute.assignedVehicle ? (
                      <div className="flex items-center gap-4 bg-green-50 p-3 rounded-xl border border-green-100">
                        <div className="p-2 bg-green-500 text-white rounded-lg">
                          <TruckIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-green-800">{selectedRoute.assignedVehicle.vehicleNumber}</p>
                          <p className="text-xs text-green-600">Driver: {selectedRoute.assignedVehicle.driver}</p>
                        </div>
                        <button 
                          onClick={() => setIsAssigning(true)} // Re-assign
                          className="text-xs text-gray-500 underline ml-2"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Assign Vehicle</label>
                        <select 
                          className="input-field text-sm py-2"
                          onChange={(e) => handleAssignVehicle(e.target.value)}
                          disabled={isAssigning}
                          defaultValue=""
                        >
                          <option value="" disabled>Select a vehicle...</option>
                          {vehicles.map(v => (
                            <option key={v._id} value={v._id}>
                              {v.vehicleNumber} ({v.driver})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
