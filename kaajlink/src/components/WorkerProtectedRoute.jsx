import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkerAuth } from '../context/WorkerAuthContext';

const WorkerProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useWorkerAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/worker/login" replace />;
  }

  return children;
};

export default WorkerProtectedRoute;
