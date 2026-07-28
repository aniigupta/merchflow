import { Router } from 'express';
import { body } from 'express-validator';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin-restricted routes
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('name').trim().notEmpty().withMessage('Category name is required')
      .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  ],
  validate,
  createCategory
);

router.put(
  '/:id',
  protect,
  adminOnly,
  [
    body('name').optional().trim().notEmpty().withMessage('Category name cannot be blank if provided')
      .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  ],
  validate,
  updateCategory
);

router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
