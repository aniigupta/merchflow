import { Router } from 'express';
import { body } from 'express-validator';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { PRINT_TYPES } from '../config/constants.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Common validator chain
const productValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Valid Category reference ID required'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('stockQuantity')
    .notEmpty().withMessage('Stock quantity is required')
    .isInt({ min: 0 }).withMessage('Stock quantity cannot be negative'),
  
  body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required')
    .isLength({ min: 3, max: 30 }).withMessage('SKU must be between 3 and 30 characters'),
];

// Admin-restricted CRUD operations (accepting multi-image uploads)
router.post(
  '/',
  protect,
  adminOnly,
  upload.array('images', 5), // field name 'images', max 5 uploads
  productValidator,
  validate,
  createProduct
);

router.put(
  '/:id',
  protect,
  adminOnly,
  upload.array('images', 5),
  [
    body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('category').optional().isMongoId().withMessage('Category must be a valid ID'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity cannot be negative'),
    body('sku').optional().trim().notEmpty().withMessage('SKU cannot be empty'),
  ],
  validate,
  updateProduct
);

router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
