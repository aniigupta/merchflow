import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { asyncHandler, sendSuccess } from '../utils/helpers.js';

/**
 * Aggregate administrative dashboard sales metrics
 * GET /api/admin/dashboard
 */
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  // 1. Total products count
  const totalProducts = await Product.countDocuments();

  // 2. Total orders count
  const totalOrders = await Order.countDocuments();

  // 3. Total revenue - sum of amount in successful payments using aggregation pipeline
  const revenueAgg = await Payment.aggregate([
    { $match: { status: 'Successful' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

  // 4. Pending orders count (Order Placed)
  const pendingOrders = await Order.countDocuments({ status: 'Order Placed' });

  // 5. Printing-in-progress orders count (Printing In Progress)
  const printingOrders = await Order.countDocuments({ status: 'Printing In Progress' });

  // 6. Delivered orders count (Delivered)
  const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });

  // 7. Low stock products (stockQuantity below 10)
  const lowStockProducts = await Product.find({ stockQuantity: { $lt: 10 } })
    .select('name sku stockQuantity price')
    .sort({ stockQuantity: 1 });

  // 8. Order status distribution aggregation for chart visualization
  const statusDistribution = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Combine into single dashboard summary
  const summary = {
    metrics: {
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      printingOrders,
      deliveredOrders,
    },
    lowStockProducts,
    statusDistribution,
  };

  sendSuccess(res, summary, 'Dashboard administrative metrics aggregated successfully');
});
