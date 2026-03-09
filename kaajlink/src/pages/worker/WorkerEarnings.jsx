import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, IndianRupee, TrendingUp, Calendar, Briefcase, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';

const WorkerEarnings = () => {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data } = await api.get('/worker-dashboard/earnings');
        setEarnings(data);
      } catch (error) {
        console.error('Failed to fetch earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      {/* Header */}
      <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/worker')} className="w-9 h-9 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">Earnings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Total earnings card */}
        <div className="bg-gradient-to-br from-primary/20 to-orange-900/30 rounded-3xl p-6 border border-primary/30 mb-6">
          <p className="text-gray-400 text-sm font-medium mb-1">Total Earnings</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">₹{earnings?.totalEarnings?.toLocaleString() || 0}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">{earnings?.totalJobs || 0} jobs completed</p>
          <p className="text-xs text-gray-500 mt-1">Rate: ₹{earnings?.hourlyRate}/hr • Platform fee: 15%</p>
        </div>

        {/* Period cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <span className="text-gray-400 text-xs font-medium">Today</span>
            </div>
            <p className="text-xl font-bold">₹{earnings?.todayEarnings?.toLocaleString() || 0}</p>
            <p className="text-gray-500 text-xs mt-1">{earnings?.todayJobs || 0} jobs</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Calendar size={16} className="text-blue-400" />
              </div>
              <span className="text-gray-400 text-xs font-medium">This Week</span>
            </div>
            <p className="text-xl font-bold">₹{earnings?.weeklyEarnings?.toLocaleString() || 0}</p>
            <p className="text-gray-500 text-xs mt-1">{earnings?.weeklyJobs || 0} jobs</p>
          </div>
        </div>

        {/* Recent completed jobs */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Completed Jobs</h3>
          
          {earnings?.recentJobs?.length === 0 ? (
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
              <Briefcase size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No completed jobs yet</p>
              <p className="text-gray-500 text-sm mt-1">Complete jobs to see earnings here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {earnings?.recentJobs?.map(job => (
                <div key={job._id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <IndianRupee size={18} className="text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{job.service}</p>
                      <p className="text-gray-500 text-xs">
                        {job.completedAt
                          ? new Date(job.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                          : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400 flex items-center gap-0.5">
                      +₹{job.earnings || 0}
                      <ArrowUpRight size={14} />
                    </p>
                    <p className="text-gray-500 text-xs">of ₹{job.totalAmount || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerEarnings;
