import express from 'express';
import {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  getTenantByUser,
  createTenantWithAccount,
  updateOwnProfile,
  registerTenant
} from '../controllers/tenantController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes (must come before /:id routes)
router.post('/register', protect, registerTenant);
router.put('/profile/me', protect, updateOwnProfile);
router.get('/user/:userId', protect, getTenantByUser);

// Admin routes
router.get('/', protect, authorize('admin'), getTenants);
router.get('/:id', protect, getTenant);
router.post('/', protect, authorize('admin'), createTenant);
router.post('/with-account', protect, authorize('admin'), createTenantWithAccount);
router.put('/:id', protect, authorize('admin'), updateTenant);
router.delete('/:id', protect, authorize('admin'), deleteTenant);

export default router;
