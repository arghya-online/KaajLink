import express from 'express';
import {
  getWorkerProfile,
  updateWorkerProfile,
  updateWorkerLocation,
  getWorkerJobs,
  getPendingJobs,
  acceptJob,
  rejectJob,
  startJob,
  completeJob,
  getEarnings,
  getDashboardStats
} from '../controllers/workerDashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require auth
router.use(protect);

// Worker profile
router.get('/profile', getWorkerProfile);
router.put('/profile', updateWorkerProfile);
router.put('/location', updateWorkerLocation);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Jobs
router.get('/jobs', getWorkerJobs);
router.get('/jobs/pending', getPendingJobs);
router.put('/jobs/:id/accept', acceptJob);
router.put('/jobs/:id/reject', rejectJob);
router.put('/jobs/:id/start', startJob);
router.put('/jobs/:id/complete', completeJob);

// Earnings
router.get('/earnings', getEarnings);

export default router;
