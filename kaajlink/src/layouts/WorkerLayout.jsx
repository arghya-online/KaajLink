import React from 'react';
import { Outlet } from 'react-router-dom';
import WorkerBottomNav from '../components/WorkerBottomNav';

const WorkerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Outlet />
      <WorkerBottomNav />
    </div>
  );
};

export default WorkerLayout;
