'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
const iconUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Icons using Tailwind classes via DivIcon
const createCustomIcon = (type: 'truck' | 'user', rotation: number = 0) => {
  const isTruck = type === 'truck';
  const color = isTruck ? 'bg-eco-600' : 'bg-blue-600';
  const html = `
    <div class="${color} p-2 rounded-full text-white shadow-lg border-2 border-white transform transition-transform duration-500" style="transform: rotate(${rotation}deg)">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
        ${
          isTruck
            ? '<path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" /><path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958 .464c.853-.175 1.522-.935 1.532-1.874V9.198c0-.755-.212-1.491-.6-2.115l-1.636-2.618A2.992 2.992 0 0018.703 3.375H16.5v3.375z" /><path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />'
            : '<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />'
        }
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

interface MapProps {
  center: [number, number];
  zoom?: number;
  vehicles?: any[];
  userLocation?: { lat: number; lng: number };
  routes?: any[];
  className?: string;
}

// Component to update map center
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function Map({ center, zoom = 13, vehicles = [], userLocation, routes = [], className }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className={className || "w-full h-full rounded-2xl z-0"}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater center={center} />

      {/* Routes Polylines */}
      {routes.map((route) => (
        <Polyline
          key={route._id}
          positions={route.waypoints.map((wp: any) => [wp.lat, wp.lng])}
          pathOptions={{ 
            color: route.status === 'completed' ? '#10B981' : '#3B82F6',
            weight: 4,
            opacity: 0.7,
            dashArray: route.status === 'pending' ? '10, 10' : undefined
          }}
        >
          <Popup>
             <div className="p-1">
               <h3 className="font-bold text-gray-800">{route.name}</h3>
               <p className="text-xs text-gray-500">{route.totalDistance} km • {route.estimatedDuration} mins</p>
             </div>
          </Popup>
        </Polyline>
      ))}

      {/* User Location */}
      {userLocation && (
        <Marker 
          position={[userLocation.lat, userLocation.lng]} 
          icon={createCustomIcon('user')}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-gray-800">Your Location</h3>
              <p className="text-sm text-gray-600">You are here</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Vehicles */}
      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle._id}
          position={[vehicle.currentLocation.lat, vehicle.currentLocation.lng]}
          icon={createCustomIcon('truck', 0)}
        >
          <Popup>
            <div className="p-2 min-w-[150px]">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  vehicle.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {vehicle.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 font-mono">{vehicle.vehicleNumber}</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{vehicle.type.replace('_', ' ')}</h3>
              <p className="text-sm text-gray-600 mb-2">{typeof vehicle.route === 'object' && vehicle.route ? vehicle.route.name : (vehicle.route || 'Unassigned')}</p>
              <div className="text-xs text-indigo-600 font-semibold">
                Driver: {vehicle.driver}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
