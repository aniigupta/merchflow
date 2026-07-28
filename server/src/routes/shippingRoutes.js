import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createShipment,
  trackShipment,
  getShippingByOrderId,
} from '../controllers/shippingController.js';

const router = Router();

// Public route for anyone to track orders
router.get(
  '/track/:trackingNumber',
  [
    param('trackingNumber').trim().notEmpty().withMessage('Tracking number is required'),
  ],
  validate,
  trackShipment
);

// Secure routes
router.post(
  '/create',
  protect,
  adminOnly,
  [
    body('orderId').isMongoId().withMessage('Valid order reference ID required'),
  ],
  validate,
  createShipment
);

router.get(
  '/order/:orderId',
  protect,
  [
    param('orderId').isMongoId().withMessage('Valid order reference ID required'),
  ],
  validate,
  getShippingByOrderId
);

export default router;
