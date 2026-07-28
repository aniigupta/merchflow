import Shipping from '../models/Shipping.js';
import Order from '../models/Order.js';
import AppError from '../utils/AppError.js';
import { asyncHandler, sendSuccess } from '../utils/helpers.js';
import { v4 as uuidv4 } from 'uuid';

// List of allowed statuses to create a shipment
const ELIGIBLE_STATUSES = ['Packed', 'Shipment Created', 'Shipped', 'Out for Delivery', 'Delivered'];
const COURIERS = ['Delhivery', 'BlueDart', 'Shiprocket Express', 'DHL India'];

/**
 * Create a mock shipment for a Packed order (Admin only)
 * POST /api/shipping/create
 */
export const createShipment = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  // 1. Verify order exists
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // 2. Enforce status rule: Must be packed or later
  if (!ELIGIBLE_STATUSES.includes(order.status)) {
    throw new AppError(`Cannot create shipment. Order status must be "Packed" or later (Current: "${order.status}").`, 400);
  }

  // 3. Check if shipment already exists
  const existingShipping = await Shipping.findOne({ order: orderId });
  if (existingShipping) {
    throw new AppError('Shipment record has already been created for this order', 400);
  }

  // 4. Generate mock details
  const randomCourier = COURIERS[Math.floor(Math.random() * COURIERS.length)];
  const trackingNumber = `TRK${uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  const shipmentId = `SHP${uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  
  // Calculate delivery date (current date + 5 days)
  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);

  // 5. Create Shipping document
  const shipping = await Shipping.create({
    order: orderId,
    courierName: randomCourier,
    trackingNumber,
    shipmentId,
    estimatedDeliveryDate,
    shippingStatus: 'Shipment Created',
  });

  // 6. Advance Order status to "Shipment Created"
  order.status = 'Shipment Created';
  order.statusHistory.push({
    status: 'Shipment Created',
    timestamp: new Date(),
    note: `Shipment created via ${randomCourier} (Tracking: ${trackingNumber})`,
  });

  await order.save();

  sendSuccess(res, shipping, 'Mock shipment created and order status advanced successfully', 201);
});

/**
 * Retrieve public tracking status for a shipment
 * GET /api/shipping/track/:trackingNumber
 */
export const trackShipment = asyncHandler(async (req, res, next) => {
  const { trackingNumber } = req.params;

  const shipping = await Shipping.findOne({ trackingNumber }).populate({
    path: 'order',
    select: 'orderNumber createdAt status',
  });

  if (!shipping) {
    throw new AppError(`Tracking number "${trackingNumber}" not recognized.`, 404);
  }

  sendSuccess(res, shipping, 'Tracking details retrieved successfully');
});

/**
 * Get shipping details for a specific order
 * GET /api/shipping/order/:orderId
 */
export const getShippingByOrderId = asyncHandler(async (req, res, next) => {
  const shipping = await Shipping.findOne({ order: req.params.orderId });
  if (!shipping) {
    throw new AppError('No shipping record found for this order ID', 404);
  }

  // Guard: Customer must own the order
  const order = await Order.findById(req.params.orderId);
  if (order && req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied. You do not own this order record.', 403);
  }

  sendSuccess(res, shipping, 'Shipping record retrieved successfully');
});
