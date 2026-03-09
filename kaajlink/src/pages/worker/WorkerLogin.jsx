import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Briefcase, ChevronLeft } from 'lucide-react';
import Button from '../../components/Button';
import { useWorkerAuth } from '../../context/WorkerAuthContext';

const WorkerLogin = () => {
  const navigate = useNavigate();
  const { login } = useWorkerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/worker');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ChevronLeft size={18} /> Back to KaajLink
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <Briefcase size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Worker Portal</h1>
            <p className="text-gray-400 mt-2">Sign in to manage your jobs & earnings</p>
          </div>

          {/* Login Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="worker@kaajlink.com"
                    className="w-full h-12 pl-12 pr-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-12 pl-12 pr-12 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="primary" fullWidth size="lg" className="mt-2 h-12 rounded-xl font-bold" disabled={loading}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : 'Sign In to Dashboard'}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Demo Worker Credentials</p>
              <p className="text-sm text-gray-300 font-mono">raju@kaajlink.com</p>
              <p className="text-sm text-gray-300 font-mono">worker123</p>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Want to become a worker?{' '}
              <Link to="/worker/register" className="text-primary font-semibold hover:underline">Register here</Link>
            </p>
            <p className="text-gray-500 text-xs mt-3">
              Are you a customer? <Link to="/login" className="text-gray-400 hover:text-white">Customer login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerLogin;
