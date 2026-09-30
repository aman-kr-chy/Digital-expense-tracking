import express from 'express';
import { addSettlement, getSettlements } from '../controllers/settlementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addSettlement)
  .get(protect, getSettlements);

export default router;
