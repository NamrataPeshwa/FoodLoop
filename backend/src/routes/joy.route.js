import express from "express";
import { getJoyMoments, getTopDonors, getJoySpreaders } from "../controllers/joyloop.controller.js";
import cache from "../middleware/cache.middleware.js";

const router = express.Router();

router.get("/joy-moments", cache("joyMoments"), getJoyMoments); // Caching 5 minutes
router.get("/top-donors", cache("topDonors"), getTopDonors);
router.get("/joy-spreaders", cache("joySpreaders"), getJoySpreaders);

export default router;
