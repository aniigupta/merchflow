import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import AppError from '../utils/AppError.js';
import { asyncHandler, sendSuccess } from '../utils/helpers.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a mock payment intent linked to an order
 * POST /api/payments/create
 */
export const createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  // 1. Verify order exists
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Guard: Customer must own the order
  if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied. You do not own this order record.', 403);
  }

  // 2. Check if successful payment already exists for this order
  const existingPayment = await Payment.findOne({ order: orderId, status: 'Successful' });
  if (existingPayment) {
    throw new AppError('Order has already been paid for successfully', 400);
  }

  // 3. Generate mock payment metadata
  const paymentId = `pay_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  const transactionId = `txn_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

  // 4. Create Payment record in Pending state
  const payment = await Payment.create({
    order: orderId,
    paymentId,
    transactionId,
    amount: order.totalAmount,
    status: 'Pending',
  });

  sendSuccess(res, payment, 'Mock payment intent created successfully', 201);
});

/**
 * Verify payment status (simulate success / failure)
 * POST /api/payments/verify
 */
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { paymentId, status: targetStatus } = req.body;

  if (!['Successful', 'Failed'].includes(targetStatus)) {
    throw new AppError('Verification status must be either "Successful" or "Failed"', 400);
  }

  // 1. Find the payment record
  const payment = await Payment.findOne({ paymentId }).populate('order');
  if (!payment) {
    throw new AppError('Payment transaction record not found', 404);
  }

  if (payment.status === 'Successful') {
    throw new AppError('Payment has already been successfully verified', 400);
  }

  const order = payment.order;
  if (!order) {
    throw new AppError('Linked order record not found', 404);
  }

  // 2. Apply target status changes
  payment.status = targetStatus;

  if (targetStatus === 'Successful') {
    payment.paymentDate = new Date();
    
    // Update order status: advance from "Order Placed" to "Payment Verified"
    // Since it's Placed -> Verified, it's index 0 -> index 1, which is valid (current + 1)
    order.status = 'Payment Verified';
    order.statusHistory.push({
      status: 'Payment Verified',
      timestamp: new Date(),
      note: 'Payment successfully completed (Mock Gateway Gateway)',
    });
    
    await order.save();
  } else {
    // If failed, payment status changes to Failed but order remains Order Placed
    // (User can retry payment)
  }

  await payment.save();

  sendSuccess(
    res,
    {
      paymentStatus: payment.status,
      orderStatus: order.status,
      transactionId: payment.transactionId,
    },
    `Payment transaction successfully processed as "${targetStatus}"`
  );
});

/**
 * Get payment details by Order ID
 * GET /api/payments/order/:orderId
 */
export const getPaymentByOrderId = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findOne({ order: req.params.orderId }).sort({ createdAt: -1 });
  if (!payment) {
    throw new AppError('No payment record found for this order', 404);
  }

  // Guard: Customer must own the order
  const order = await Order.findById(req.params.orderId);
  if (order && req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied. You do not own this order record.', 403);
  }

  sendSuccess(res, payment, 'Payment record retrieved successfully');
});

