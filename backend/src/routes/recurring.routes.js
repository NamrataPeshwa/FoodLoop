import express from 'express';
import { createRecurring } from '../controllers/recurring.controller.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/create', authMiddleware, createRecurring);
export default router;