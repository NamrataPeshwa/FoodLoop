import express from 'express';
import { getUserProfile } from '../controllers/user.controller.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);

export default router;
