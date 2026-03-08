import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Import actual pages
import Home from './pages/Home';
import Services from './pages/Services';
import WorkersList from './pages/WorkersList';
import WorkerProfile from './pages/WorkerProfile';
import BookService from './pages/BookService';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import PostRequest from './pages/PostRequest';
import AvailablePros from './pages/AvailablePros';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/post-request" element={<PostRequest />} />
          <Route path="/available-pros" element={<AvailablePros />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/profile" element={<Profile />} />
          {/* Legacy routes kept just in case for now */}
          <Route path="/workers/:service" element={<WorkersList />} />
          <Route path="/worker/:id" element={<WorkerProfile />} />
          <Route path="/book/:workerId" element={<BookService />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
