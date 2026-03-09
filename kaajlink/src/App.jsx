import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WorkerAuthProvider } from './context/WorkerAuthContext';
import MainLayout from './layouts/MainLayout';
import WorkerLayout from './layouts/WorkerLayout';
import ProtectedRoute from './components/ProtectedRoute';
import WorkerProtectedRoute from './components/WorkerProtectedRoute';

// Customer pages
import Home from './pages/Home';
import Services from './pages/Services';
import WorkersList from './pages/WorkersList';
import WorkerProfile from './pages/WorkerProfile';
import BookService from './pages/BookService';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import PostRequest from './pages/PostRequest';
import AvailablePros from './pages/AvailablePros';
import Login from './pages/Login';
import Register from './pages/Register';

// Worker pages
import WorkerLogin from './pages/worker/WorkerLogin';
import WorkerRegister from './pages/worker/WorkerRegister';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerJobs from './pages/worker/WorkerJobs';
import WorkerEarnings from './pages/worker/WorkerEarnings';
import WorkerSettings from './pages/worker/WorkerSettings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <WorkerAuthProvider>
          <Routes>
            {/* Customer auth pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Worker auth pages */}
            <Route path="/worker/login" element={<WorkerLogin />} />
            <Route path="/worker/register" element={<WorkerRegister />} />

            {/* Customer app pages */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/post-request" element={<PostRequest />} />
              <Route path="/available-pros" element={<AvailablePros />} />
              <Route path="/workers/:service" element={<WorkersList />} />
              <Route path="/worker-profile/:id" element={<WorkerProfile />} />
              <Route path="/book/:workerId" element={<BookService />} />

              <Route path="/bookings" element={
                <ProtectedRoute><Bookings /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
            </Route>

            {/* Worker dashboard pages */}
            <Route element={
              <WorkerProtectedRoute>
                <WorkerLayout />
              </WorkerProtectedRoute>
            }>
              <Route path="/worker" element={<WorkerDashboard />} />
              <Route path="/worker/jobs" element={<WorkerJobs />} />
              <Route path="/worker/earnings" element={<WorkerEarnings />} />
              <Route path="/worker/settings" element={<WorkerSettings />} />
            </Route>
          </Routes>
        </WorkerAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
