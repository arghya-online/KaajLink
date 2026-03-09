import express from 'express';
import { registerWorker, loginWorker } from '../controllers/workerDashboardController.js';

const router = express.Router();

router.post('/register', registerWorker);
router.post('/login', loginWorker);

export default router;
