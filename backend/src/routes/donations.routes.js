import express from 'express';
import { createDonation, getDonations, getUserDonations } from '../controllers/donations.controller.js';  
import { authMiddleware } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.post('/create', authMiddleware, createDonation);
router.get('/list', getDonations);
router.get("/my", authMiddleware, getUserDonations);



export default router;
