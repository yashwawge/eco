'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  PhotoIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  CameraIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Report {
  _id: string;
  type: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  photos: string[];
  completionPhoto?: string;
  assignedTo?: string;
  reportedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  ecoPointsAwarded: number;
}

// Mock crew members - in production, this would come from an API
const CREW_MEMBERS = [
  { id: '1', name: 'Ramesh Kumar', role: 'Team Lead', available: true },
  { id: '2', name: 'Suresh Babu', role: 'Sanitation Worker', available: true },
  { id: '3', name: 'Ganesh Rao', role: 'Sanitation Worker', available: true },
  { id: '4', name: 'Prakash Reddy', role: 'Driver', available: true },
  { id: '5', name: 'Vijay Singh', role: 'Sanitation Worker', available: false },
  { id: '6', name: 'Ravi Kumar', role: 'Team Lead', available: true },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<string>('');
  const [completionPhoto, setCompletionPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCrew = async () => {
    if (!selectedCrew || !selectedReport) return;

    setActionLoading('assigning');
    try {
      const crewMember = CREW_MEMBERS.find(c => c.id === selectedCrew);
      const res = await fetch(`/api/reports/${selectedReport._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'assigned',
          assignedTo: crewMember?.name
        }),
      });

      if (res.ok) {
        const { report } = await res.json();
        setReports(reports.map(r => r._id === selectedReport._id ? report : r));
        setSelectedReport(report);
        setShowAssignModal(false);
        setSelectedCrew('');
        alert(`Successfully assigned to ${crewMember?.name}`);
      }
    } catch (error) {
      console.error('Failed to assign crew:', error);
      alert('Failed to assign crew');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCompletionPhoto(result);
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResolveWithPhoto = async () => {
    if (!completionPhoto || !selectedReport) {
      alert('Please upload a completion photo');
      return;
    }

    setActionLoading('resolving');
    try {
      // Upload photo to Cloudinary
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: completionPhoto, folder: 'eco-waste/completions' }),
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload photo');
      }

      const { url } = await uploadRes.json();

      // Update report status
      const res = await fetch(`/api/reports/${selectedReport._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resolved',
          completionPhoto: url
        }),
      });

      if (res.ok) {
        const { report } = await res.json();
        setReports(reports.map(r => r._id === selectedReport._id ? report : r));
        setSelectedReport(report);
        setShowPhotoModal(false);
        setCompletionPhoto(null);
        setPhotoPreview(null);
        alert('Report marked as resolved!');
      }
    } catch (error) {
      console.error('Failed to resolve report:', error);
      alert('Failed to resolve report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (!selectedReport) return;

    // Validation: Must assign crew before changing to assigned
    if (newStatus === 'assigned' && selectedReport.status === 'pending') {
      setShowAssignModal(true);
      return;
    }

    // Validation: Must upload photo before resolving
    if (newStatus === 'resolved') {
      if (selectedReport.status === 'pending') {
        alert('Please assign a crew member first before resolving');
        return;
      }
      setShowPhotoModal(true);
      return;
    }

    // For other status changes
    updateStatus(selectedReport._id, newStatus);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const { report } = await res.json();
        setReports(reports.map(r => r._id === id ? report : r));
        if (selectedReport?._id === id) {
          setSelectedReport(report);
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReports = reports.filter(r =>
    filter === 'all' ? true : r.status === filter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'assigned': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-indigo-100 text-indigo-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="page-container h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
            Issue Reports
          </h1>
          <p className="text-gray-500">Manage and resolve citizen reported issues</p>
        </div>
        <button
          onClick={fetchReports}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Refresh"
        >
          <ArrowPathIcon className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-white/50 backdrop-blur-sm rounded-xl w-fit">
        {['all', 'pending', 'in_progress', 'resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab
              ? 'bg-white shadow-sm text-eco-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/30'
              }`}
          >
            {tab.replace('_', ' ').charAt(0).toUpperCase() + tab.replace('_', ' ').slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Reports List */}
        <div className="w-full md:w-1/2 lg:w-2/5 overflow-y-auto pr-2 space-y-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 animate-pulse h-32"></div>
            ))
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No reports found in this category.</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <motion.div
                key={report._id}
                layoutId={report._id}
                onClick={() => setSelectedReport(report)}
                className={`glass-card p-4 cursor-pointer border-2 transition-all hover:scale-[1.01] ${selectedReport?._id === report._id
                  ? 'border-eco-500 shadow-lg'
                  : 'border-transparent hover:border-eco-200'
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full uppercase font-bold tracking-wider ${getStatusBadge(report.status)}`}>
                    {report.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-800 mb-1">
                  {report.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{report.description}</p>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="truncate">{report.location.address}</span>
                </div>

                {report.assignedTo && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>Assigned to: {report.assignedTo}</span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Report Details - Right Panel */}
        <div className={`flex-1 glass-card p-6 overflow-y-auto ${selectedReport
          ? 'fixed inset-4 z-50 md:static md:inset-auto md:block'
          : 'hidden md:block'
          }`}>
          <AnimatePresence mode="wait">
            {selectedReport ? (
              <motion.div
                key={selectedReport._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReport(null)}
                        className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <ArrowLeftIcon className="w-6 h-6" />
                        <span className="sr-only">Back</span>
                      </button>
                      <span className={`px-3 py-1 text-sm rounded-full uppercase font-bold tracking-wider ${getStatusBadge(selectedReport.status)}`}>
                        {selectedReport.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold mt-2 text-gray-800">
                      {selectedReport.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h2>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {selectedReport.status === 'pending' && (
                      <button
                        onClick={() => setShowAssignModal(true)}
                        disabled={!!actionLoading}
                        className="btn-secondary flex-1 md:flex-none flex justify-center items-center gap-2"
                      >
                        <UserGroupIcon className="w-5 h-5" />
                        Assign Crew
                      </button>
                    )}

                    {selectedReport.status === 'assigned' && (
                      <button
                        onClick={() => updateStatus(selectedReport._id, 'in_progress')}
                        disabled={!!actionLoading}
                        className="btn-secondary flex-1 md:flex-none flex justify-center items-center gap-2"
                      >
                        Mark In Progress
                      </button>
                    )}

                    {(selectedReport.status === 'assigned' || selectedReport.status === 'in_progress') && (
                      <button
                        onClick={() => handleStatusChange('resolved')}
                        disabled={!!actionLoading}
                        className="btn-primary flex-1 md:flex-none flex justify-center items-center gap-2"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Location</h3>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-700 flex items-start gap-2">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="break-words">{selectedReport.location.address}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Reported By</h3>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-700 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{selectedReport.reportedBy?.name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500 break-all">{selectedReport.reportedBy?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedReport.assignedTo && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Assigned To</h3>
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-700 flex items-center gap-2">
                      <UserGroupIcon className="w-5 h-5 flex-shrink-0" />
                      <p className="font-medium">{selectedReport.assignedTo}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Description</h3>
                  <div className="p-4 bg-gray-50 rounded-lg text-gray-700 border border-gray-100">
                    <p>{selectedReport.description}</p>
                  </div>
                </div>

                {selectedReport.photos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Evidence Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedReport.photos.map((photo, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                          {photo ? (
                            <img src={photo} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                              <PhotoIcon className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.completionPhoto && (
                  <div>
                    <h3 className="text-sm font-semibold text-green-600 mb-2 uppercase tracking-wide">✓ Completion Photo</h3>
                    <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-green-200 shadow-md max-w-md">
                      <img src={selectedReport.completionPhoto} alt="Completion" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FunnelIcon className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg text-center">Select a report to view details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Assign Crew Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Assign Crew Member</h3>
                <button onClick={() => setShowAssignModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {CREW_MEMBERS.map((member) => (
                  <label
                    key={member.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedCrew === member.id
                      ? 'border-eco-500 bg-eco-50'
                      : member.available
                        ? 'border-gray-200 hover:border-eco-300 bg-white'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                  >
                    <input
                      type="radio"
                      name="crew"
                      value={member.id}
                      checked={selectedCrew === member.id}
                      onChange={(e) => setSelectedCrew(e.target.value)}
                      disabled={!member.available}
                      className="w-5 h-5 text-eco-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.role}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${member.available ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                      {member.available ? 'Available' : 'Busy'}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignCrew}
                  disabled={!selectedCrew || actionLoading === 'assigning'}
                  className="flex-1 px-4 py-3 bg-gradient-eco text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === 'assigning' ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Completion Photo Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowPhotoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Upload Completion Photo</h3>
                <button onClick={() => setShowPhotoModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Please upload a photo showing the cleaned/resolved area to mark this report as complete.
              </p>

              <div className="mb-6">
                {photoPreview ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-eco-300">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        setPhotoPreview(null);
                        setCompletionPhoto(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-eco-500 hover:bg-eco-50/30 transition-all">
                    <CameraIcon className="w-16 h-16 text-gray-400 mb-3" />
                    <span className="text-gray-600 font-medium">Click to upload photo</span>
                    <span className="text-sm text-gray-400 mt-1">JPG, PNG or WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPhotoModal(false);
                    setPhotoPreview(null);
                    setCompletionPhoto(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveWithPhoto}
                  disabled={!completionPhoto || actionLoading === 'resolving'}
                  className="flex-1 px-4 py-3 bg-gradient-eco text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === 'resolving' ? 'Uploading...' : 'Mark as Resolved'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
