import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
  getContractsByTenant,
  uploadContractFile,
  signContractByTenant,
  signContractByAdmin,
  getContractSignatureStatus,
  confirmContract
} from '../controllers/contractController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'contracts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'contract-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Create multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const router = express.Router();

router.get('/', protect, authorize('admin'), getContracts);
router.get('/tenant/:tenantId', protect, getContractsByTenant);
router.get('/:id', protect, getContract);
router.post('/', protect, authorize('admin'), createContract);
router.put('/:id', protect, authorize('admin'), updateContract);
router.delete('/:id', protect, authorize('admin'), deleteContract);
router.post('/:id/upload', protect, authorize('admin'), upload.single('contractFile'), uploadContractFile);

// Signature routes
router.post('/:id/sign-tenant', protect, signContractByTenant);
router.post('/:id/sign-admin', protect, authorize('admin'), signContractByAdmin);
router.get('/:id/signature-status', protect, getContractSignatureStatus);
router.post('/:id/confirm', protect, authorize('admin'), confirmContract);

export default router;
