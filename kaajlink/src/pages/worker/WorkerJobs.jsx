import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, MapPin, Phone, CheckCircle2, Play, XCircle, User, Navigation } from 'lucide-react';
import api from '../../services/api';
import RouteMap from '../../components/RouteMap';
import { useWorkerAuth } from '../../context/WorkerAuthContext';

const WorkerJobs = () => {
  const navigate = useNavigate();
  const { worker } = useWorkerAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [routeJobId, setRouteJobId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get(`/worker-dashboard/jobs?status=${filter}`);
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/worker-dashboard/jobs/${id}/accept`);
      fetchJobs();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this job?')) return;
    try {
      await api.put(`/worker-dashboard/jobs/${id}/reject`);
      fetchJobs();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed');
    }
  };

  const handleStart = async (id) => {
    try {
      await api.put(`/worker-dashboard/jobs/${id}/start`);
      fetchJobs();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed');
    }
  };

  const handleComplete = async (id) => {
    const amount = prompt('Enter the total amount charged (₹):', '500');
    if (!amount) return;
    try {
      await api.put(`/worker-dashboard/jobs/${id}/complete`, { amount: parseInt(amount) });
      fetchJobs();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed');
    }
  };

  const statusConfig = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
    confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Confirmed' },
    'in-progress': { bg: 'bg-indigo-500/20', text: 'text-indigo-400', label: 'In Progress' },
    completed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Completed' },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' }
  };

  const filters = ['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      {/* Header */}
      <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/worker')} className="w-9 h-9 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">My Jobs</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Jobs list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <Clock size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No jobs found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {jobs.map(job => {
              const status = statusConfig[job.status] || statusConfig.pending;
              return (
                <div key={job._id} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold">{job.service}</h3>
                      <p className="text-gray-400 text-sm mt-0.5 flex items-center gap-1">
                        <User size={12} /> {job.user?.name || 'Customer'}
                      </p>
                    </div>
                    <span className={`${status.bg} ${status.text} text-xs font-bold px-2.5 py-1 rounded-lg`}>
                      {status.label}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-3">{job.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.address}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(job.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {job.user?.phone && (
                      <a href={`tel:${job.user.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                        <Phone size={12} /> Call Customer
                      </a>
                    )}
                  </div>

                  {job.totalAmount > 0 && (
                    <div className="bg-gray-700/50 rounded-xl px-3 py-2 mb-3 text-sm">
                      <span className="text-gray-400">Amount:</span>{' '}
                      <span className="font-bold text-green-400">₹{job.totalAmount}</span>
                      {job.earnings > 0 && (
                        <span className="text-gray-500 ml-2">(Your earning: ₹{job.earnings})</span>
                      )}
                    </div>
                  )}

                  {/* Action buttons based on status */}
                  <div className="flex gap-2">
                    {job.status === 'pending' && (
                      <>
                        <button onClick={() => handleAccept(job._id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={16} /> Accept
                        </button>
                        <button onClick={() => handleReject(job._id)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5">
                          <XCircle size={16} /> Decline
                        </button>
                      </>
                    )}
                    {job.status === 'confirmed' && (
                      <button onClick={() => handleStart(job._id)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5">
                        <Play size={16} /> Start Job
                      </button>
                    )}
                    {job.status === 'in-progress' && (
                      <button onClick={() => handleComplete(job._id)} className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={16} /> Mark Complete
                      </button>
                    )}
                  </div>

                  {/* Route map for active jobs */}
                  {(job.status === 'confirmed' || job.status === 'in-progress' || job.status === 'pending') && job.coordinates?.lat && worker?.coordinates?.lat && (
                    <div className="mt-2">
                      <button
                        onClick={() => setRouteJobId(routeJobId === job._id ? null : job._id)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 font-semibold py-2.5 rounded-xl transition-colors text-sm"
                      >
                        <Navigation size={16} /> {routeJobId === job._id ? 'Hide Route' : 'View Route & ETA'}
                      </button>

                      {routeJobId === job._id && (
                        <div className="mt-3">
                          <RouteMap
                            from={{ lat: worker.coordinates.lat, lng: worker.coordinates.lng, label: '🔧 You' }}
                            to={{ lat: job.coordinates.lat, lng: job.coordinates.lng, label: `📍 ${job.user?.name || 'Customer'}` }}
                            height="250px"
                            showDirections={true}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerJobs;
