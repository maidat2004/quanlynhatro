import express from 'express';
import { receiveSepayWebhook } from '../controllers/sepayWebhookController.js';

const router = express.Router();

router.post('/', receiveSepayWebhook);

export default router;
