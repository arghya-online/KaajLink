import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const WorkerAuthContext = createContext(null);

export const useWorkerAuth = () => {
  const context = useContext(WorkerAuthContext);
  if (!context) {
    throw new Error('useWorkerAuth must be used within a WorkerAuthProvider');
  }
  return context;
};

export const WorkerAuthProvider = ({ children }) => {
  const [worker, setWorker] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('kaajlink_worker_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorker = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get('/worker-dashboard/profile');
          setWorker(data);
        } catch (error) {
          console.error('Failed to load worker:', error);
          logout();
        }
      }
      setLoading(false);
    };
    loadWorker();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/worker-auth/login', { email, password });
    localStorage.setItem('kaajlink_worker_token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    // Fetch full worker profile
    const { data: profile } = await api.get('/worker-dashboard/profile');
    setWorker(profile);
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post('/worker-auth/register', formData);
    localStorage.setItem('kaajlink_worker_token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    const { data: profile } = await api.get('/worker-dashboard/profile');
    setWorker(profile);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('kaajlink_worker_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setWorker(null);
  };

  const refreshProfile = async () => {
    try {
      const { data } = await api.get('/worker-dashboard/profile');
      setWorker(data);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  const value = {
    worker,
    token,
    loading,
    isAuthenticated: !!worker,
    login,
    register,
    logout,
    refreshProfile
  };

  return (
    <WorkerAuthContext.Provider value={value}>
      {children}
    </WorkerAuthContext.Provider>
  );
};

export default WorkerAuthContext;
