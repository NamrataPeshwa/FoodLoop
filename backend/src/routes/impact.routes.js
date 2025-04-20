import express from 'express';
import { getImpactStats } from '../controllers/impact.controller.js';

const router = express.Router();

router.get('/impact', getImpactStats);

export default router;
