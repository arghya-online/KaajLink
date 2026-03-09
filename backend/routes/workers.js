import express from 'express';
import { getWorkers, getTopWorkers, getWorker, getWorkersByService, addReview } from '../controllers/workerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getWorkers);
router.get('/top', getTopWorkers);
router.get('/service/:serviceName', getWorkersByService);
router.get('/:id', getWorker);
router.post('/:id/reviews', protect, addReview);

export default router;
