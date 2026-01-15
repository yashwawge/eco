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
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

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
  reportedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  ecoPointsAwarded: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const updateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        // Update local state
        setReports(reports.map(r => 
          r._id === id ? { ...r, status: newStatus as any } : r
        ));
        if (selectedReport?._id === id) {
          setSelectedReport(prev => prev ? { ...prev, status: newStatus as any } : null);
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab 
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
                className={`glass-card p-4 cursor-pointer border-2 transition-all hover:scale-[1.01] ${
                  selectedReport?._id === report._id 
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
              </motion.div>
            ))
          )}
        </div>

        {/* Report Details - Right Panel */}
        <div className={`flex-1 glass-card p-6 overflow-y-auto ${
          selectedReport 
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
                        onClick={() => updateStatus(selectedReport._id, 'assigned')}
                        disabled={!!actionLoading}
                        className="btn-secondary flex-1 md:flex-none flex justify-center items-center gap-2"
                      >
                        {actionLoading === selectedReport._id ? 'Assigning...' : 'Assign Crew'}
                      </button>
                    )}
                    {selectedReport.status !== 'resolved' && selectedReport.status !== 'rejected' && (
                       <button 
                         onClick={() => updateStatus(selectedReport._id, 'resolved')}
                         disabled={!!actionLoading}
                         className="btn-primary flex-1 md:flex-none flex justify-center items-center gap-2"
                       >
                         {actionLoading === selectedReport._id ? 'Verifying...' : 'Verify & Resolve'}
                         <CheckCircleIcon className="w-5 h-5" />
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
                        <p className="font-medium">{selectedReport.reportedBy.name}</p>
                        <p className="text-xs text-gray-500 break-all">{selectedReport.reportedBy.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

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
                           <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                             <PhotoIcon className="w-8 h-8" />
                           </div>
                        </div>
                      ))}
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
    </div>
  );
}
