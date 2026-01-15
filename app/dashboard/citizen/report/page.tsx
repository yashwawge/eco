'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  CameraIcon, 
  MapPinIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const REPORT_TYPES = [
  { id: 'illegal_dumping', label: 'Illegal Dumping', icon: TrashIcon },
  { id: 'missed_pickup', label: 'Missed Pickup', icon: ClockIcon },
  { id: 'poor_sanitation', label: 'Poor Sanitation', icon: ExclamationTriangleIcon },
  { id: 'segregation_issue', label: 'Segregation Issue', icon: RecycleIcon },
];

import { ClockIcon } from '@heroicons/react/24/outline';
// Dummy RecycleIcon since it's not in Heroicons outline by default with this name, we used SparklesIcon before but let's use ArrowPathIcon for recycling
import { ArrowPathIcon as RecycleIcon } from '@heroicons/react/24/outline';

export default function ReportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    photo: '',
    location: { lat: 0, lng: 0, address: '' },
  });
  const [loading, setLoading] = useState(false);

  const handleGetLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Reverse Geocoding using Nominatim (Free, OpenStreetMap)
          let address = 'Detected Location';
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await res.json();
            if (data && data.display_name) {
              address = data.display_name.split(',').slice(0, 3).join(','); // Shorten address
            }
          } catch (e) {
            console.error('Geocoding error:', e);
          }

          setFormData({
            ...formData,
            location: {
              ...formData.location,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: address,
            },
          });
          setLoading(false);
          setStep(2); 
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get location. Please allow location access.');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // reportedBy handled by server session
          type: formData.type,
          description: formData.description,
          location: {
            coordinates: {
              lat: formData.location.lat,
              lng: formData.location.lng,
            },
            address: formData.location.address || 'Detected Location',
          },
          photos: [formData.photo], 
        }),
      });

      if (response.ok) {
        setStep(4); // Success step
      } else {
        alert('Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Report an Issue</h1>
        <p className="text-gray-600">Help keep our city clean by reporting issues</p>
      </div>

      {step < 4 && (
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step >= s ? 'bg-eco-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="glass-card p-6"
      >
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Where is the issue?</h2>
            
            <div className="p-12 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-gray-50">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <MapPinIcon className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-6 text-center">We need your location to send the cleanup crew</p>
              
              <button
                onClick={handleGetLocation}
                disabled={loading}
                className="btn-primary w-full max-w-xs flex items-center justify-center gap-2"
              >
                {loading ? <span className="spinner"></span> : <MapPinIcon className="w-5 h-5" />}
                Use Current Location
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-center">What is the issue?</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData({ ...formData, type: type.id })}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                    formData.type === type.id
                      ? 'border-eco-500 bg-eco-50 text-eco-700'
                      : 'border-gray-200 hover:border-eco-200'
                  }`}
                >
                  <type.icon className="w-8 h-8" />
                  <span className="font-medium text-sm">{type.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700">Back</button>
              <button
                onClick={() => formData.type && setStep(3)}
                disabled={!formData.type}
                className="btn-primary"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Add details & photo</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                required
                rows={3}
                className="input-field"
                placeholder="Describe the issue..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo Evidence</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 bg-gray-50 transition-colors overflow-hidden"
                >
                  {formData.photo ? (
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <CameraIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-500 text-sm">Click to upload photo</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button type="button" onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-700">
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !formData.description}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? <span className="spinner"></span> : null}
                Submit Report
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for being a responsible citizen. You've earned <span className="font-bold text-eco-600">10 Eco-Points</span>!
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push('/dashboard/citizen')} className="btn-primary">
                Back to Dashboard
              </button>
              <button onClick={() => {
                setStep(1);
                setFormData({ type: '', description: '', photo: '', location: { lat: 0, lng: 0, address: '' } });
              }} className="text-eco-600 font-medium">
                Submit Another Report
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
