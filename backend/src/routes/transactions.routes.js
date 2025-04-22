import express from "express";
import {
  matchFoodListings,
  confirmDeliveryAndMintNFT,
  confirmParticipation,
  rejectParticipation,
} from "../controllers/transactions.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { updateTransactionStatus } from "../controllers/transactions.controller.js";
import { getUserTransactions } from "../controllers/transactions.controller.js";

const router = express.Router();

router.post(
  "/confirm-delivery/:transactionId",
  authMiddleware,
  confirmDeliveryAndMintNFT
);

router.patch(
  '/:transactionId/status',
  authMiddleware,
  updateTransactionStatus
);
router.get('/', authMiddleware, getUserTransactions);
router.post("/match", matchFoodListings);
router.post('/confirm/:transactionId/:userId', confirmParticipation);
router.post('/reject/:transactionId/:userId', rejectParticipation);


export default router;
