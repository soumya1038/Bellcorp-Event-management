import express from 'express';
import { registerForEvent, cancelRegistration } from '../controllers/registration.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:id/register', protect, registerForEvent);

router.delete('/:id/register', protect, cancelRegistration);

export default router;
