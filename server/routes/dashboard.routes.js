import express from 'express';
import { getUserDashboard } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getUserDashboard);

export default router;
