import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createPaymentIntent,
  verifyPayment,
  getPaymentByOrderId,
} from '../controllers/paymentController.js';

const router = Router();

// Secure all payment routes
router.use(protect);

router.post(
  '/create',
  [
    body('orderId').isMongoId().withMessage('Valid order reference ID required'),
  ],
  validate,
  createPaymentIntent
);

router.post(
  '/verify',
  [
    body('paymentId').trim().notEmpty().withMessage('Payment reference ID is required'),
    body('status')
      .trim()
      .isIn(['Successful', 'Failed']).withMessage('Status must be either "Successful" or "Failed"'),
  ],
  validate,
  verifyPayment
);

router.get('/order/:orderId', getPaymentByOrderId);


export default router;
