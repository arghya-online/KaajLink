import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth pages - no layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* App pages - with layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/post-request" element={<PostRequest />} />
            <Route path="/available-pros" element={<AvailablePros />} />
            <Route path="/workers/:service" element={<WorkersList />} />
            <Route path="/worker/:id" element={<WorkerProfile />} />
            <Route path="/book/:workerId" element={<BookService />} />

            {/* Protected routes */}
            <Route path="/bookings" element={
              <ProtectedRoute><Bookings /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
