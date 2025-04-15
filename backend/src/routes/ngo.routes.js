import express from 'express';
import { claimDonation } from '../controllers/ngo.controller.js'; 
import { authMiddleware } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.post('/claim/:id', authMiddleware, claimDonation);

export default router;
