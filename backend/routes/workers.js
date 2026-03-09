import express from 'express';
import { getWorkers, getTopWorkers, getWorker, getWorkersByService, addReview } from '../controllers/workerController.js';
import { getNearbyWorkers } from '../controllers/workerDashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getWorkers);
router.get('/top', getTopWorkers);
router.get('/nearby', getNearbyWorkers);
router.get('/service/:serviceName', getWorkersByService);
router.get('/:id', getWorker);
router.post('/:id/reviews', protect, addReview);

export default router;
