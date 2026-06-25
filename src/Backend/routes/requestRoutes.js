import express from 'express';
import {
  getRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
  getRequestsByTenant,
  resolveRequest
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getRequests);
router.get('/tenant/:tenantId', protect, getRequestsByTenant);
router.get('/:id', protect, getRequest);
router.post('/', protect, createRequest);
router.put('/:id', protect, authorize('admin'), updateRequest);
router.put('/:id/resolve', protect, authorize('admin'), resolveRequest);
router.delete('/:id', protect, authorize('admin'), deleteRequest);

export default router;
