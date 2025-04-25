import express from "express";
import {
  matchFoodListings,
  confirmDeliveryAndMintNFT
 
} from "../controllers/transactions.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

import { getUserTransactions ,  
  getOrderTimeline, 
  updateOrderStatus , rejectParticipation} from "../controllers/transactions.controller.js";

const router = express.Router();

router.post(
  "/confirm-delivery/:transactionId",
  authMiddleware,
  confirmDeliveryAndMintNFT
);

router.patch(
  '/:transactionId/status',
  authMiddleware,
  updateOrderStatus
);
router.get('/', authMiddleware, getUserTransactions);
router.post("/match", matchFoodListings);
// Routes for blockchain confirmation
router.post('/transactions/confirm/:transactionId', authMiddleware, confirmDeliveryAndMintNFT);

// Routes for order timeline
router.get('/orders/:orderId/timeline', authMiddleware, getOrderTimeline);

// Routes for updating order status
// router.put('/orders/:orderId/update-status', 
//   authMiddleware, 
//   validationRules.updateOrderStatus, 
//   validate, 
//   updateOrderStatus
// );
router.post('/reject/:transactionId/:userId', rejectParticipation);


export default router;
