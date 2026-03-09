import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, LogOut, MapPin, Phone, IndianRupee, User, Wrench, Info } from 'lucide-react';
import api from '../../services/api';
import { useWorkerAuth } from '../../context/WorkerAuthContext';
import LocationPicker from '../../components/LocationPicker';

const WorkerSettings = () => {
  const navigate = useNavigate();
  const { worker, logout, refreshProfile } = useWorkerAuth();
  const [formData, setFormData] = useState({
    phone: worker?.phone || '',
    hourlyRate: worker?.hourlyRate || 300,
    about: worker?.about || '',
    service: worker?.service || ''
  });
  const [coordinates, setCoordinates] = useState(worker?.coordinates || null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = { ...formData };
      if (coordinates) payload.coordinates = coordinates;
      await api.put('/worker-dashboard/profile', payload);
      await refreshProfile();
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/worker/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      {/* Header */}
      <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/worker')} className="w-9 h-9 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Profile header */}
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 mb-6 flex items-center gap-4">
          <img
            src={worker?.image || `https://ui-avatars.com/api/?name=${worker?.name}&background=F97316&color=fff&size=200`}
            alt={worker?.name}
            className="w-16 h-16 rounded-2xl object-cover"
          />
          <div>
            <h2 className="text-xl font-bold">{worker?.name}</h2>
            <p className="text-gray-400 text-sm">{worker?.service} • ⭐ {worker?.rating}</p>
            <p className="text-gray-500 text-xs mt-0.5">{worker?.jobsDone} jobs done • {worker?.experience} yrs experience</p>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User size={18} className="text-primary" /> Profile Settings
          </h3>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full h-11 pl-10 pr-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Service Category</label>
              <div className="relative">
                <Wrench size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <select name="service" value={formData.service} onChange={handleChange} className="w-full h-11 pl-10 pr-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none">
                  {['Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Repair', 'Mechanic', 'Tutor', 'House Cleaner', 'Pest Control', 'Appliance Repair', 'Beautician', 'Driver'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Hourly Rate (₹)</label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input name="hourlyRate" type="number" value={formData.hourlyRate} onChange={handleChange} min="100" className="w-full h-11 pl-10 pr-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">About</label>
              <textarea name="about" value={formData.about} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-primary" /> Your Location
          </h3>
          <LocationPicker
            onLocationSelect={(coords) => setCoordinates(coords)}
            initialPosition={worker?.coordinates}
            height="200px"
          />
        </div>

        {/* Actions */}
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${message.includes('success') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mb-3"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save size={18} /> Save Changes
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-gray-800 hover:bg-gray-700 text-red-400 border border-gray-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default WorkerSettings;
