import express from "express";
import {
  matchFoodListings,
  confirmDeliveryAndMintNFT,
} from "../controllers/transactions.controller.mjs";

const router = express.Router();

router.post(
  "/confirm-delivery/:transactionId",
  authMiddleware,
  confirmDeliveryAndMintNFT
);

router.post("/match", matchFoodListings);

export default router;
