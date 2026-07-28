import { Router } from 'express';
import { body } from 'express-validator';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ORDER_STATUSES } from '../config/constants.js';
import {
  createOrder,
  getOrders,
  getOrderById,
  advanceOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';

const router = Router();

// All order operations require user authentication
router.use(protect);

router.get('/', getOrders);
router.get('/:id', getOrderById);

router.post(
  '/',
  [
    body('shippingAddress.fullName').trim().notEmpty().withMessage('Recipient full name is required'),
    body('shippingAddress.phone').trim().notEmpty().withMessage('Recipient phone number is required'),
    body('shippingAddress.line1').trim().notEmpty().withMessage('Shipping address line 1 is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('Shipping city is required'),
    body('shippingAddress.state').trim().notEmpty().withMessage('Shipping state is required'),
    body('shippingAddress.postalCode').trim().notEmpty().withMessage('Shipping postal code is required'),
    body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  ],
  validate,
  createOrder
);

router.patch(
  '/:id/status',
  adminOnly,
  [
    body('status')
      .trim()
      .notEmpty().withMessage('Target status is required')
      .isIn(ORDER_STATUSES).withMessage(`Status must be one of: ${ORDER_STATUSES.join(', ')}`),
    body('note').optional().trim().isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters'),
  ],
  validate,
  advanceOrderStatus
);

router.patch(
  '/:id/cancel',
  [
    body('cancelReason').optional().trim().isLength({ max: 500 }).withMessage('Cancellation reason cannot exceed 500 characters'),
  ],
  validate,
  cancelOrder
);

export default router;
