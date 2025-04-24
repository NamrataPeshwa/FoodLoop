import express from "express";
import cache from "../middleware/cache.js";
import { getPackagingSuggestions, getDisposalInstructions } from "../controllers/packagingController.js";

const router = express.Router();

router.get("/packaging/:listingId", cache("packaging"), getPackagingSuggestions);
router.get("/disposal/:transactionId", cache("disposal"), getDisposalInstructions);

export default router;
