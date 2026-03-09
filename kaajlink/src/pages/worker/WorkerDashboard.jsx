import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle2, IndianRupee, MapPin, Bell, Power, PowerOff, Star, TrendingUp, Navigation } from 'lucide-react';
import api from '../../services/api';
import { useWorkerAuth } from '../../context/WorkerAuthContext';
import MapView, { workerActiveIcon, jobIcon } from '../../components/MapView';
import RouteMap from '../../components/RouteMap';
import io from 'socket.io-client';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { worker, refreshProfile } = useWorkerAuth();
  const [stats, setStats] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(worker?.isAvailable ?? true);
  const [selectedJobForRoute, setSelectedJobForRoute] = useState(null);
  const [livePosition, setLivePosition] = useState(null);
  const socketRef = useRef(null);
  const watchRef = useRef(null);

  // Socket.IO live location broadcasting
  useEffect(() => {
    if (!isOnline) return;

    const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Worker socket connected');
      // Emit initial position
      const coords = worker?.coordinates || { lat: 22.572, lng: 88.363 };
      socket.emit('worker:online', {
        workerId: worker?._id,
        lat: coords.lat,
        lng: coords.lng,
      });
    });

    // Start GPS watch
    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          // Only update if accuracy is reasonable (< 500m) or if it's the best we have
          if (accuracy < 500 || !livePosition) {
            setLivePosition({ lat: latitude, lng: longitude });
            if (socketRef.current?.connected) {
              socketRef.current.emit('worker:location-update', {
                workerId: worker?._id,
                lat: latitude,
                lng: longitude,
              });
            }
            // Also update backend
            api.put('/worker-dashboard/location', { lat: latitude, lng: longitude }).catch(() => {});
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 30000 }
      );
    }

    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      if (socketRef.current) {
        socketRef.current.emit('worker:offline', { workerId: worker?._id });
        socketRef.current.disconnect();
      }
    };
  }, [isOnline, worker?._id]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        api.get('/worker-dashboard/stats'),
        api.get('/worker-dashboard/jobs/pending')
      ]);
      setStats(statsRes.data);
      setPendingJobs(jobsRes.data);
      setIsOnline(statsRes.data.worker.isAvailable);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      await api.put('/worker-dashboard/profile', { isAvailable: !isOnline });
      setIsOnline(!isOnline);
      refreshProfile();
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const handleAcceptJob = async (jobId) => {
    try {
      await api.put(`/worker-dashboard/jobs/${jobId}/accept`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept job');
    }
  };

  const handleRejectJob = async (jobId) => {
    if (!confirm('Are you sure you want to reject this job?')) return;
    try {
      await api.put(`/worker-dashboard/jobs/${jobId}/reject`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject job');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const workerData = stats?.worker;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      {/* Top bar */}
      <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <img
                src={workerData?.image || `https://ui-avatars.com/api/?name=${workerData?.name}&background=F97316&color=fff`}
                alt={workerData?.name}
                className="w-10 h-10 rounded-xl object-cover"
              />
            </div>
            <div>
              <h2 className="font-bold text-sm">{workerData?.name}</h2>
              <p className="text-gray-400 text-xs">{workerData?.service} • ⭐ {workerData?.rating}</p>
            </div>
          </div>

          {/* Online/Offline toggle */}
          <button
            onClick={toggleAvailability}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
              isOnline
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {isOnline ? <Power size={16} /> : <PowerOff size={16} />}
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock size={16} className="text-yellow-400" />
              </div>
              <span className="text-gray-400 text-xs font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold">{stats?.stats?.pending || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Briefcase size={16} className="text-blue-400" />
              </div>
              <span className="text-gray-400 text-xs font-medium">Active</span>
            </div>
            <p className="text-2xl font-bold">{stats?.stats?.active || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-green-400" />
              </div>
              <span className="text-gray-400 text-xs font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold">{stats?.stats?.completed || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <IndianRupee size={16} className="text-primary" />
              </div>
              <span className="text-gray-400 text-xs font-medium">Earnings</span>
            </div>
            <p className="text-2xl font-bold">₹{workerData?.totalEarnings || 0}</p>
          </div>
        </div>

        {/* Map showing worker location + route to selected job */}
        {workerData?.coordinates && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {selectedJobForRoute ? '🗺️ Route to Job' : 'Your Location'}
              {isOnline && livePosition && (
                <span className="ml-2 text-green-400 text-xs font-normal">● Broadcasting live</span>
              )}
            </h3>

            {selectedJobForRoute?.coordinates?.lat ? (
              <div className="flex flex-col gap-2">
                <RouteMap
                  from={{
                    lat: livePosition?.lat || workerData.coordinates.lat,
                    lng: livePosition?.lng || workerData.coordinates.lng,
                    label: '🔧 You',
                  }}
                  to={{
                    lat: selectedJobForRoute.coordinates.lat,
                    lng: selectedJobForRoute.coordinates.lng,
                    label: `📍 ${selectedJobForRoute.user?.name || 'Customer'}`,
                  }}
                  height="250px"
                  showDirections={true}
                />
                <button
                  onClick={() => setSelectedJobForRoute(null)}
                  className="text-sm text-gray-400 hover:text-white transition-colors text-center py-1"
                >
                  ← Back to overview map
                </button>
              </div>
            ) : (
              <MapView
                center={[
                  livePosition?.lat || workerData.coordinates.lat,
                  livePosition?.lng || workerData.coordinates.lng
                ]}
                zoom={13}
                height="200px"
                markers={[
                  {
                    id: 'self',
                    lat: livePosition?.lat || workerData.coordinates.lat,
                    lng: livePosition?.lng || workerData.coordinates.lng,
                    name: 'You',
                    service: workerData.service,
                    popup: true,
                    icon: workerActiveIcon
                  },
                  ...pendingJobs.filter(j => j.coordinates?.lat).map(j => ({
                    id: j._id,
                    lat: j.coordinates.lat,
                    lng: j.coordinates.lng,
                    name: j.user?.name || 'Customer',
                    service: j.service,
                    popup: true,
                    icon: jobIcon,
                    onClick: () => setSelectedJobForRoute(j),
                  }))
                ]}
              />
            )}
          </div>
        )}

        {/* New Job Requests */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Bell size={16} /> New Job Requests ({pendingJobs.length})
          </h3>

          {pendingJobs.length === 0 ? (
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
              <Briefcase size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No pending requests</p>
              <p className="text-gray-500 text-sm mt-1">New jobs will appear here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingJobs.map(job => (
                <div key={job._id} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{job.service}</h4>
                      <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {job.address}
                      </p>
                    </div>
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-lg">
                      New
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-3">{job.description}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                    <span>👤 {job.user?.name || 'Customer'}</span>
                    <span>📅 {new Date(job.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span>🕒 {new Date(job.scheduledDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAcceptJob(job._id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleRejectJob(job._id)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      ✗ Decline
                    </button>
                  </div>
                  {job.coordinates?.lat && (
                    <button
                      onClick={() => setSelectedJobForRoute(job)}
                      className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 font-semibold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      <Navigation size={16} /> View Route & ETA
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/worker/jobs')}
            className="bg-gray-800 hover:bg-gray-750 rounded-2xl p-4 border border-gray-700 text-left transition-colors"
          >
            <Briefcase size={20} className="text-blue-400 mb-2" />
            <p className="font-semibold text-sm">My Jobs</p>
            <p className="text-gray-500 text-xs">View all jobs</p>
          </button>
          <button
            onClick={() => navigate('/worker/earnings')}
            className="bg-gray-800 hover:bg-gray-750 rounded-2xl p-4 border border-gray-700 text-left transition-colors"
          >
            <TrendingUp size={20} className="text-green-400 mb-2" />
            <p className="font-semibold text-sm">Earnings</p>
            <p className="text-gray-500 text-xs">View earnings</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
