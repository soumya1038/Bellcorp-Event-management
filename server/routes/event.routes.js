import express from 'express';
import { createEvent, getEvents, getEventById } from '../controllers/event.controller.js';
import { creatorOnly, protect, protectOptional } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, creatorOnly, createEvent);

router.get('/', protectOptional, getEvents);

router.get('/:id', protectOptional, getEventById);

export default router;
