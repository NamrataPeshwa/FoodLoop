import express from 'express';
import { createDonation, getDonations, getUserDonations } from '../controllers/donations.controller.js';  
import { authMiddleware } from '../middleware/authMiddleware.js'; 
import  { upload } from '../middleware/multerConfig.js';

const router = express.Router();

router.post('/create',authMiddleware, upload.array('images'), createDonation);
router.get('/list', getDonations);
router.get("/my", authMiddleware, getUserDonations);



export default router;
