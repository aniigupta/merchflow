import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Shipping from '../models/Shipping.js';
import AppError from '../utils/AppError.js';
import { asyncHandler, sendSuccess } from '../utils/helpers.js';
import { calculateCartTotals } from '../utils/cartCalculator.js';

// Order sequence steps list
const ORDER_STEPS = [
  'Order Placed',
  'Payment Verified',
  'Design Approved',
  'Printing In Progress',
  'Quality Check',
  'Packed',
  'Shipment Created',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

/**
 * Helper to validate if an admin can advance the status
 * @param {string} currentStatus - Current order status string
 * @param {string} targetStatus - Target order status string
 * @returns {boolean} True if transition is valid
 */
export const checkValidTransition = (currentStatus, targetStatus) => {
  if (currentStatus === 'Cancelled' || currentStatus === 'Delivered') {
    return false;
  }

  const currentIdx = ORDER_STEPS.indexOf(currentStatus);
  const targetIdx = ORDER_STEPS.indexOf(targetStatus);

  // Must only move to current + 1
  return targetIdx === currentIdx + 1;
};

/**
 * Place a new order from user's shopping cart
 * POST /api/orders
 */
export const createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, notes } = req.body;

  // 1. Fetch user's cart with product details populated
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'name sku price stockQuantity isActive',
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError('Cannot place an order with an empty shopping cart', 400);
  }

  // 2. Map cart items to order items snapshot, and verify stock levels
  const orderItems = [];
  for (const item of cart.items) {
    const prod = item.product;
    if (!prod || !prod.isActive) {
      throw new AppError(`Product "${item.product?.name || 'Unknown'}" is inactive or unavailable.`, 400);
    }
    if (item.quantity > prod.stockQuantity) {
      throw new AppError(`Insufficient stock for product "${prod.name}" (${prod.stockQuantity} remaining).`, 400);
    }
    
    orderItems.push({
      product: prod._id,
      name: prod.name,
      sku: prod.sku,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      printLocation: item.printLocation,
      designImage: item.designImage,
      unitPrice: item.unitPrice,
    });
  }

  // 3. Compute totals using utility
  const { subtotal, tax, shippingCharge, total } = calculateCartTotals(orderItems);

  // 4. Create Order document
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    subtotal,
    tax,
    shippingCharge,
    totalAmount: total,
    status: 'Order Placed',
    notes,
  });

  // 5. Decrement inventory stock levels for ordered items
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stockQuantity: -item.quantity },
    });
  }

  // 6. Clear shopping cart items
  cart.items = [];
  await cart.save();

  sendSuccess(res, order, 'Order placed successfully. Your cart has been cleared.', 201);
});

/**
 * Get user's orders (Customer) or all orders (Admin)
 * GET /api/orders
 */
export const getOrders = asyncHandler(async (req, res, next) => {
  const queryObj = {};

  if (req.user.role === 'admin') {
    const { status, startDate, endDate } = req.query;

    if (status) {
      queryObj.status = status;
    }

    if (startDate || endDate) {
      queryObj.createdAt = {};
      if (startDate) {
        queryObj.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        queryObj.createdAt.$lte = new Date(endDate);
      }
    }
  } else {
    // Customers only see their own orders
    queryObj.user = req.user._id;
  }

  const orders = await Order.find(queryObj)
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  sendSuccess(res, orders, 'Orders retrieved successfully');
});

/**
 * Get single order details
 * GET /api/orders/:id
 */
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'images');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Guard: Customers can only fetch their own orders
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied. You do not own this order record.', 403);
  }

  sendSuccess(res, order, 'Order details retrieved successfully');
});

/**
 * Advance order status to the next stage (Admin only)
 * PATCH /api/orders/:id/status
 */
export const advanceOrderStatus = asyncHandler(async (req, res, next) => {
  const { status: targetStatus } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const currentStatus = order.status;

  // 1. Verify target status index matches current + 1
  const isValid = checkValidTransition(currentStatus, targetStatus);
  if (!isValid) {
    const currentIdx = ORDER_STEPS.indexOf(currentStatus);
    const expectedStatus = currentIdx > -1 && currentIdx < ORDER_STEPS.length - 1 
      ? ORDER_STEPS[currentIdx + 1] 
      : 'None (Completed)';
      
    throw new AppError(
      `Invalid workflow transition! You cannot skip steps. Current: "${currentStatus}". Expected next: "${expectedStatus}". Attempted: "${targetStatus}"`,
      400
    );
  }

  // 2. Perform transition
  order.status = targetStatus;
  order.statusHistory.push({
    status: targetStatus,
    timestamp: new Date(),
    changedBy: req.user._id,
    note: req.body.note || `Advanced by admin: ${req.user.name}`,
  });

  await order.save();

  // Sync with shipping status if shipment exists
  const syncShippingStatuses = ['Shipped', 'Out for Delivery', 'Delivered'];
  if (syncShippingStatuses.includes(targetStatus)) {
    try {
      const shipping = await Shipping.findOne({ order: order._id });
      if (shipping) {
        shipping.shippingStatus = targetStatus;
        await shipping.save();
      }
    } catch (err) {
      console.error('Failed to sync status with shipping record', err);
    }
  }

  sendSuccess(res, order, `Order advanced to "${targetStatus}" successfully`);
});

/**
 * Cancel an order (Customer can cancel if before printing)
 * PATCH /api/orders/:id/cancel
 */
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { cancelReason } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Guard: Customer must own the order
  const isOwner = order.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new AppError('Access denied. You do not have permissions to cancel this order.', 403);
  }

  // Enforce cancellation limit: Only "Order Placed" or "Payment Verified" are cancelable
  const cancelableStates = ['Order Placed', 'Payment Verified'];
  if (!cancelableStates.includes(order.status)) {
    throw new AppError(`Cannot cancel order. The current status is "${order.status}". Custom printing printing has already started.`, 400);
  }

  // Restock items inventory
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stockQuantity: item.quantity },
    });
  }

  // Apply Cancellation status
  order.status = 'Cancelled';
  order.statusHistory.push({
    status: 'Cancelled',
    timestamp: new Date(),
    changedBy: req.user._id,
    note: cancelReason || 'Cancelled by customer',
  });

  await order.save();
  sendSuccess(res, order, 'Order has been successfully cancelled and items restocked');
});
