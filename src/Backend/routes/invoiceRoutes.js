import express from 'express';
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicesByTenant,
  payInvoice,
  submitInvoicePayment,
  rejectInvoicePayment,
  sendInvoice,
  createBulkDraftInvoices
} from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getInvoices);
router.get('/tenant/:tenantId', protect, getInvoicesByTenant);
router.get('/:id', protect, getInvoice);
router.post('/bulk-draft', protect, authorize('admin'), createBulkDraftInvoices);
router.post('/', protect, authorize('admin'), createInvoice);
router.put('/:id', protect, authorize('admin'), updateInvoice);
router.put('/:id/submit-payment', protect, submitInvoicePayment);
router.put('/:id/reject-payment', protect, authorize('admin'), rejectInvoicePayment);
router.put('/:id/pay', protect, authorize('admin'), payInvoice);
router.post('/:id/send', protect, authorize('admin'), sendInvoice);
router.delete('/:id', protect, authorize('admin'), deleteInvoice);

export default router;
