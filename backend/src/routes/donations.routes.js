import express from 'express';
import { createDonation, getDonations } from '../controllers/donations.controller.js';  
import { authMiddleware } from '../middleware/authMiddleware.js'; 
import foodLoopAbi from "../blockchain/build/contracts/FoodLoop.json" assert { type: "json" };
const web3 = new Web3(process.env.INFURA_URL); // if using dotenv

const router = express.Router();

router.post('/create', authMiddleware, createDonation);
router.get('/list', getDonations);
router.get("/top-donors", getTopDonors);
router.get("/my", authMiddleware, getUserDonations);

app.post("/confirm-delivery", async (req, res) => {
    try {
        const { donor, foodType, weight, location, timestamp, deliveryId } = req.body;

        // Call the smart contract function (without NGO signature)
        const data = contract.methods.confirmDeliveryAndMintNFT(
            deliveryId, donor, foodType, weight, location, timestamp
        ).encodeABI();

        const tx = {
            to: contractAddress,
            data,
            gas: 3000000,
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        res.json({ success: true, transactionHash: receipt.transactionHash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
