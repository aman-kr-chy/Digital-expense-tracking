import express from 'express';
import { recordWebsiteVisit } from '../controllers/visitorController.js';

const router = express.Router();

router.post('/visit', recordWebsiteVisit);

export default router;
