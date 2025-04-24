import express from 'express';
import { createRecurring, getMyRecurring } from '../controllers/recurring.controller.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/create', authMiddleware, createRecurring);
router.get('/existing', authMiddleware, getMyRecurring);
export default router;