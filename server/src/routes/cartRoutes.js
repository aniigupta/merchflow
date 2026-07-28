import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { PRINT_LOCATIONS } from '../config/constants.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  uploadDesign,
} from '../controllers/cartController.js';

const router = Router();

// All shopping cart operations require authentication
router.use(protect);

router.get('/', getCart);

router.post(
  '/',
  [
    body('product').isMongoId().withMessage('Valid product reference ID required'),
    body('size').trim().notEmpty().withMessage('Size specification is required'),
    body('color').trim().notEmpty().withMessage('Color specification is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be an integer of 1 or more'),
    body('printLocation')
      .trim()
      .notEmpty().withMessage('Print location is required')
      .isIn(PRINT_LOCATIONS).withMessage(`Print location must be one of: ${PRINT_LOCATIONS.join(', ')}`),
    body('designImage').optional().trim(),
  ],
  validate,
  addToCart
);

router.put(
  '/:itemId',
  [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be an integer of 1 or more'),
  ],
  validate,
  updateCartItem
);

router.delete('/:itemId', removeFromCart);

// Route for design image upload
router.post('/upload', upload.single('designImage'), uploadDesign);

export default router;
