import express from 'express';
import { getRecommendations, trackInteraction } from '../controllers/recommendationController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getRecommendations);
router.post('/track', optionalProtect, trackInteraction);

export default router;
