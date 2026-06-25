import express from 'express';
import {
  getUpdateRequests,
  getUpdateRequestById,
  getUpdateRequestsByTenant,
  createUpdateRequest,
  approveUpdateRequest,
  rejectUpdateRequest,
  deleteUpdateRequest
} from '../controllers/updateRequestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin only routes
router.get('/', authorize('admin'), getUpdateRequests);
router.delete('/:id', authorize('admin'), deleteUpdateRequest);
router.put('/:id/approve', authorize('admin'), approveUpdateRequest);
router.put('/:id/reject', authorize('admin'), rejectUpdateRequest);

// Both admin and user routes
router.post('/', createUpdateRequest);
router.get('/:id', getUpdateRequestById);
router.get('/tenant/:tenantId', getUpdateRequestsByTenant);

export default router;
