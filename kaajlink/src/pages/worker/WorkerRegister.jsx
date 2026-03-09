import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Briefcase, ChevronLeft, User, Phone, Wrench } from 'lucide-react';
import Button from '../../components/Button';
import { useWorkerAuth } from '../../context/WorkerAuthContext';

const WorkerRegister = () => {
  const navigate = useNavigate();
  const { register } = useWorkerAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    service: 'Electrician',
    hourlyRate: 300,
    about: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const services = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Repair', 'Mechanic', 'Tutor', 'House Cleaner', 'Pest Control', 'Appliance Repair', 'Beautician', 'Driver'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/worker');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <div className="p-4">
        <Link to="/worker/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ChevronLeft size={18} /> Back to Login
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/30">
              <Wrench size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Join as a Worker</h1>
            <p className="text-gray-400 mt-1 text-sm">Start earning by offering your services</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700 p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full h-11 pl-11 pr-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required />
                </div>
                <div className="col-span-2 relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full h-11 pl-11 pr-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required />
                </div>
                <div className="col-span-2 relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full h-11 pl-11 pr-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Password" className="w-full h-11 pl-11 pr-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm" className="w-full h-11 pl-11 pr-10 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Service Category</label>
                <select name="service" value={formData.service} onChange={handleChange} className="w-full h-11 px-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none cursor-pointer">
                  {services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Hourly Rate (₹)</label>
                <input name="hourlyRate" type="number" value={formData.hourlyRate} onChange={handleChange} className="w-full h-11 px-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" min="100" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">About You</label>
                <textarea name="about" value={formData.about} onChange={handleChange} placeholder="Describe your experience and expertise..." className="w-full h-20 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none" />
              </div>

              <Button type="submit" variant="primary" fullWidth size="lg" className="mt-1 h-12 rounded-xl font-bold" disabled={loading}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : 'Create Worker Account'}
              </Button>
            </form>
          </div>

          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account? <Link to="/worker/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkerRegister;
