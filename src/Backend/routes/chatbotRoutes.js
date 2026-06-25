import express from 'express';
import { chatWithBot } from '../controllers/chatbotController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', optionalProtect, chatWithBot);

export default router;
